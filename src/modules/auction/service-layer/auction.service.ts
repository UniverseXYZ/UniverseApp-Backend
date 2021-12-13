import { Injectable } from '@nestjs/common';
import { getManager, In, LessThan, MoreThan, Not, Repository, Transaction, TransactionRepository } from 'typeorm';
import { RewardTier } from '../domain/reward-tier.entity';
import { RewardTierNft } from '../domain/reward-tier-nft.entity';
import { Auction } from '../domain/auction.entity';
import { S3Service } from '../../file-storage/s3.service';
import { AppConfig } from 'src/modules/configuration/configuration.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AuctionStatus } from '../domain/types';
import {
  CreateAuctionBody,
  EditAuctionBody,
  UpdateRewardTierBody,
  DepositNftsBody,
  PlaceBidBody,
  ChangeAuctionStatus,
  AddRewardTierBodyParams,
  WithdrawNftsBody,
} from '../entrypoints/dto';
import { Nft } from 'src/modules/nft/domain/nft.entity';
import { AuctionNotFoundException } from './exceptions/AuctionNotFoundException';
import { AuctionBadOwnerException } from './exceptions/AuctionBadOwnerException';
import { AuctionCannotBeModifiedException } from './exceptions/AuctionCannotBeModifiedException';
import { RewardTierNFTUsedInOtherTierException } from './exceptions/RewardTierNFTUsedInOtherTierException';
import { FileSystemService } from '../../file-system/file-system.service';
import { RewardTierNotFoundException } from './exceptions/RewardTierNotFoundException';
import { RewardTierBadOwnerException } from './exceptions/RewardTierBadOwnerException';
import { UsersService } from '../../users/users.service';
import { classToPlain } from 'class-transformer';
import { UploadResult } from 'src/modules/file-storage/model/UploadResult';
import { NftCollection } from 'src/modules/nft/domain/collection.entity';
import { AuctionBid } from '../domain/auction.bid.entity';
import { User } from 'src/modules/users/user.entity';
import { AuctionGateway } from './auction.gateway';
import { AuctionBidNotFoundException } from './exceptions/AuctionBidNotFoundException';

@Injectable()
export class AuctionService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(RewardTier)
    private rewardTierRepository: Repository<RewardTier>,
    @InjectRepository(RewardTierNft)
    private rewardTierNftRepository: Repository<RewardTierNft>,
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    @InjectRepository(NftCollection)
    private nftCollectionRepository: Repository<NftCollection>,
    @InjectRepository(Nft)
    private nftRepository: Repository<Nft>,
    @InjectRepository(AuctionBid)
    private auctionBidRepository: Repository<AuctionBid>,
    private s3Service: S3Service,
    private fileSystemService: FileSystemService,
    private gateway: AuctionGateway,
    private readonly config: AppConfig,
  ) {}

  async getAuctionPage(username: string, auctionName: string) {
    const artist = await this.usersService.getByUsername(username);

    //TODO: add a check if the auction has started
    const auction = await this.auctionRepository.findOne({ link: auctionName });

    if (!auction) {
      throw new AuctionNotFoundException();
    }

    // TODO: Add collection info for each nft(Maybe won't be needed)
    const rewardTiers = await this.rewardTierRepository.find({ where: { auctionId: auction.id } });
    const rewardTierNfts = await this.rewardTierNftRepository.find({
      where: { rewardTierId: In(rewardTiers.map((rewardTier) => rewardTier.id)) },
    });

    const nftIds = rewardTierNfts.map((rewardTierNft) => rewardTierNft.nftId);

    const nfts = await this.nftRepository.find({ where: { id: In(nftIds) } });
    const nftCollectionids = nfts.map((nft) => nft.collectionId);

    const collections = await this.nftCollectionRepository.find({ id: In(nftCollectionids) });
    const idNftMap = nfts.reduce((acc, nft) => ({ ...acc, [nft.id]: nft }), {} as Record<string, Nft>);

    const rewardTierNftsMap = rewardTierNfts.reduce(
      (acc, rewardTierNft) => ({
        ...acc,
        [rewardTierNft.rewardTierId]: [...(acc[rewardTierNft.rewardTierId] || []), idNftMap[rewardTierNft.nftId]],
      }),
      {} as Record<string, Nft[]>,
    );

    //TODO: Add pagination to this query to reduce the load on the BE
    // https://github.com/UniverseXYZ/UniverseApp-Backend/issues/100
    const now = new Date().toISOString();
    const moreActiveAuctions = await this.auctionRepository.find({
      where: { userId: artist.id, id: Not(auction.id), startDate: LessThan(now), endDate: MoreThan(now) },
    });

    const bids = await this.auctionBidRepository
      .createQueryBuilder('bid')
      .leftJoinAndMapOne('bid.user', User, 'bidder', 'bidder.id = bid.userId')
      .where({ auctionId: auction.id })
      .orderBy('bid.amount', 'DESC')
      .getMany();

    bids.sort((a, b) => b.amount - a.amount);

    return {
      auction: classToPlain(auction),
      artist: classToPlain(artist),
      collections: classToPlain(collections),
      rewardTiers: rewardTiers.map((rewardTier) => ({
        ...classToPlain(rewardTier),
        nfts: rewardTierNftsMap[rewardTier.id].map((nft) => classToPlain(nft)),
      })),
      moreActiveAuctions: moreActiveAuctions.map((a) => classToPlain(a)),
      bidders: bids,
    };
  }

  async createRewardTier(userId: number, params: AddRewardTierBodyParams) {
    const {
      auctionId,
      rewardTier: { name, numberOfWinners, nftsPerWinner, minimumBid, nftSlots },
    } = params;

    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });

    if (!auction) {
      throw new AuctionNotFoundException();
    }

    await this.validateAuctionPermissions(userId, auctionId);

    const { depositedNfts, canceled, finalised, startDate } = auction;

    const now = new Date();
    const started = now >= startDate;

    if (depositedNfts || canceled || finalised || started) {
      throw new AuctionCannotBeModifiedException();
    }

    const currentTiers = await this.rewardTierRepository.findAndCount({ where: { auctionId } });
    const nextTierIndex = currentTiers[1];

    const tier = this.rewardTierRepository.create();
    tier.auctionId = auction.id;
    tier.userId = userId;
    tier.name = name;
    tier.numberOfWinners = numberOfWinners;
    tier.nftsPerWinner = nftsPerWinner;
    tier.minimumBid = minimumBid;
    tier.tierPosition = nextTierIndex;
    await this.rewardTierRepository.save(tier);

    for (const nftSlot of nftSlots) {
      for (const nftId of nftSlot.nftIds) {
        const nftUsedInOtherTier = await this.rewardTierNftRepository.findOne({ where: { nftId } });
        if (nftUsedInOtherTier) {
          throw new RewardTierNFTUsedInOtherTierException();
        }

        const rewardTierNft = this.rewardTierNftRepository.create();
        rewardTierNft.nftId = nftId;
        rewardTierNft.slot = nftSlot.slot;
        rewardTierNft.rewardTierId = tier.id;
        await this.rewardTierNftRepository.save(rewardTierNft);
      }
    }

    return tier;
  }

  async updateRewardTier(userId: number, id: number, params: UpdateRewardTierBody) {
    return await getManager().transaction('SERIALIZABLE', async (transactionalEntityManager) => {
      const tier = await this.rewardTierRepository.findOne({ where: { id } });

      if (!tier) {
        throw new RewardTierNotFoundException();
      }

      if (tier.userId !== userId) {
        throw new RewardTierBadOwnerException();
      }
      //TODO: Add validation(ex: numberOfWinners should eq tier.nftSlots.length)
      //TODO: Add validation(ex: nftsPerWinnder should eq tier.nftSlots.nftIds.length)
      tier.name = params.name ? params.name : tier.name;
      tier.numberOfWinners = params.numberOfWinners ? params.numberOfWinners : tier.numberOfWinners;
      tier.nftsPerWinner = params.nftsPerWinner ? params.nftsPerWinner : tier.nftsPerWinner;

      if (typeof params.description === 'string' || params.description === null) {
        tier.description = params.description;
      }

      if (typeof params.minimumBid === 'number' || params.minimumBid === null) {
        tier.minimumBid = params.minimumBid;
      }

      if (typeof params.color === 'string' || params.color === null) {
        tier.color = params.color;
      }

      await transactionalEntityManager.save(tier);

      if (params.nftSlots) {
        const rewardTierNfts = await this.rewardTierNftRepository.find({ where: { rewardTierId: id } });
        const nftIds = rewardTierNfts.map((nft) => nft.nftId);
        const reducedNftIds = params.nftSlots.reduce(
          (acc, slot) => (acc = { ...acc, nftIds: [...acc.nftIds, ...slot.nftIds] }),
        );

        const nftSlotsToDelete = nftIds.filter((nftId) => !reducedNftIds.nftIds.includes(nftId));
        const nftSlotsToCreate = [];
        const nftSlotsToChange = [];

        params.nftSlots.forEach((nftSlot) => {
          nftSlot.nftIds.forEach((slotNftId) => {
            if (!nftIds.includes(slotNftId)) {
              nftSlotsToCreate.push({
                nftIds: [slotNftId],
                slot: nftSlot.slot,
              });
              return;
            }

            const toChangeRewardTier = rewardTierNfts.find((rwt) => rwt.nftId == slotNftId);
            if (toChangeRewardTier?.slot !== nftSlot.slot) {
              nftSlotsToChange.push({
                id: toChangeRewardTier.id,
                slot: nftSlot.slot,
              });
              return;
            }
          });
        });

        if (nftSlotsToDelete.length > 0) {
          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from(RewardTierNft)
            .where('nftId IN (:...idsToDelete)', { idsToDelete: nftSlotsToDelete })
            .execute();
        }

        const newRewardTierNfts = nftSlotsToCreate.map((nftSlot) => {
          for (const nftId of nftSlot.nftIds) {
            return this.rewardTierNftRepository.create({
              rewardTierId: tier.id,
              nftId: nftId,
              slot: nftSlot.slot,
            });
          }
        });

        await Promise.all(newRewardTierNfts.map((rewardTierNft) => this.rewardTierNftRepository.save(rewardTierNft)));

        for (let i = 0; i < nftSlotsToChange.length; i++) {
          const toUpdateSlot = nftSlotsToChange[i];
          await this.rewardTierNftRepository.update(toUpdateSlot.id, { slot: toUpdateSlot.slot });
        }
      }

      const rewardTierNfts = await this.rewardTierNftRepository.find({ where: { rewardTierId: id } });
      const nftIds = rewardTierNfts.map((nft) => nft.nftId);
      const nfts = await this.nftRepository.find({ where: { id: In(nftIds) } });
      return {
        ...classToPlain(tier),
        nfts: nfts.map((nft) => classToPlain(nft)),
      };
    });
  }

  private async validateTierPermissions(userId: number, tierId: number) {
    const tier = await this.rewardTierRepository.findOne({ where: { id: tierId } });

    if (!tier) {
      throw new RewardTierNotFoundException();
    }

    if (tier.userId !== userId) {
      throw new RewardTierBadOwnerException();
    }

    return tier;
  }

  async updateRewardTierExtraData(
    userId: number,
    tierId: number,
    params: { customDescription: string; tierColor: string },
  ) {
    // const tier = await this.validateTierPermissions(userId, tierId);
    // tier.customDescription = params.customDescription ? params.customDescription : tier.customDescription;
    // tier.tierColor = params.tierColor ? params.tierColor : tier.tierColor;
    // await this.rewardTierRepository.save(tier);
    // return tier;
  }

  async updateRewardTierImage(userId: number, tierId: number, image: Express.Multer.File) {
    const user = await this.usersService.getById(userId, true);
    const rewardTier = await this.validateTierPermissions(user.id, tierId);

    let s3Result: UploadResult;

    if (image) {
      s3Result = await this.s3Service.uploadDocument(image.path, image.filename);
      rewardTier.imageUrl = s3Result.url;
      await this.rewardTierRepository.save(rewardTier);
      await this.fileSystemService.removeFile(image.path);
    }

    return classToPlain(rewardTier);
  }

  @Transaction()
  async createAuction(
    userId: number,
    createAuctionBody: CreateAuctionBody,
    @TransactionRepository(RewardTier) rewardTierRepository?: Repository<RewardTier>,
    @TransactionRepository(RewardTierNft) rewardTierNftRepository?: Repository<RewardTierNft>,
    @TransactionRepository(Auction) auctionRepository?: Repository<Auction>,
  ) {
    // TODO: Add checks to verify all auctions params are ok
    let auction = auctionRepository.create({
      userId,
      name: createAuctionBody.name,
      startingBid: createAuctionBody.startingBid,
      tokenAddress: createAuctionBody.tokenAddress,
      tokenSymbol: createAuctionBody.tokenSymbol,
      tokenDecimals: createAuctionBody.tokenDecimals,
      startDate: createAuctionBody.startDate,
      endDate: createAuctionBody.endDate,
      royaltySplits: createAuctionBody.royaltySplits,
    });
    auction = await auctionRepository.save(auction);

    for (const [index, rewardTierBody] of createAuctionBody.rewardTiers.entries()) {
      const rewardTier = rewardTierRepository.create();
      rewardTier.auctionId = auction.id;
      rewardTier.userId = userId;
      rewardTier.name = rewardTierBody.name;
      rewardTier.numberOfWinners = rewardTierBody.numberOfWinners;
      rewardTier.nftsPerWinner = rewardTierBody.nftsPerWinner;
      rewardTier.minimumBid = rewardTierBody.minimumBid;
      rewardTier.tierPosition = index;
      await rewardTierRepository.save(rewardTier);

      for (const nftSlot of rewardTierBody.nftSlots) {
        for (const nftId of nftSlot.nftIds) {
          const rewardTierNft = rewardTierNftRepository.create();
          rewardTierNft.nftId = nftId;
          rewardTierNft.slot = nftSlot.slot;
          rewardTierNft.rewardTierId = rewardTier.id;
          await rewardTierNftRepository.save(rewardTierNft);
        }
      }
    }

    return {
      id: auction.id,
    };
  }

  public async deployAuction(userId: number, deployBody: DeployAuctionBody) {
    // TODO: This is a temporary endpoint to create auction. In the future the scraper should fill in these fields
    const auction = await this.validateAuctionPermissions(userId, deployBody.auctionId);
    //TODO: We need some kind of validation that this on chain id really exists
    const deployedAuction = await this.auctionRepository.update(auction.id, {
      onChain: true,
      onChainId: deployBody.onChainId,
      txHash: deployBody.txHash,
    });

    return {
      auction: classToPlain(deployedAuction),
    };
  }

  public async cancelOnChainAuction(userId: number, auctionId: number) {
    // TODO: This is a temporary endpoint to create auction. In the future the scraper should fill in these fields
    const auction = await this.validateAuctionPermissions(userId, auctionId);
    //TODO: We need some kind of validation that this on chain id really exists
    const deployedAuction = await this.auctionRepository.update(auctionId, {
      onChain: false,
      onChainId: null,
      txHash: '',
    });

    return {
      auction: classToPlain(deployedAuction),
    };
  }

  public async depositNfts(userId: number, depositNftsBody: DepositNftsBody) {
    // TODO: This is a temporary endpoint to deposit nfts. In the future the scraper should fill in these fields
    await this.validateAuctionPermissions(userId, depositNftsBody.auctionId);
    //TODO: We need some kind of validation that this on chain id really exists
    const depositResult = await this.rewardTierNftRepository.update(
      { nftId: In(depositNftsBody.nftIds) },
      { deposited: true },
    );

    return {
      depositedNfts: depositResult.affected,
    };
  }

  public async withdrawNfts(userId: number, withdrawNftsBody: WithdrawNftsBody) {
    // TODO: This is a temporary endpoint to withdraw nfts. In the future the scraper should fill in these fields
    await this.validateAuctionPermissions(userId, withdrawNftsBody.auctionId);
    //TODO: We need some kind of validation that this on chain id really exists
    const withdrawResult = await this.rewardTierNftRepository.update(
      { nftId: In(withdrawNftsBody.nftIds) },
      { deposited: false },
    );

    return {
      withdrawnNfts: withdrawResult.affected,
    };
  }

  private async validateAuctionPermissions(userId: number, auctionId: number) {
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });

    if (!auction) {
      throw new AuctionNotFoundException();
    }

    if (userId !== auction.userId) {
      throw new AuctionBadOwnerException();
    }

    return auction;
  }

  async updateAuction(userId: number, auctionId: number, updateAuctionBody: EditAuctionBody) {
    let auction = await this.validateAuctionPermissions(userId, auctionId);

    for (const key in updateAuctionBody) {
      auction[key] = updateAuctionBody[key];
    }
    auction = await this.auctionRepository.save(auction);

    return auction;
  }

  async cancelFutureAuction(userId: number, auctionId: number) {
    const auction = await this.validateAuctionPermissions(userId, auctionId);
    let canceled = false;
    const now = new Date();
    // TODO: Add more validations if needed
    if (now < auction.startDate) {
      await getManager().transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.delete(Auction, { id: auctionId });
        const rewardTiers = await this.rewardTierRepository.find({ auctionId: auction.id });
        const rewardTiersIdsToDelete = rewardTiers.map((tier) => tier.id);
        await transactionalEntityManager.delete(RewardTier, { id: In(rewardTiersIdsToDelete) });
        await transactionalEntityManager.delete(RewardTierNft, { rewardTierId: In(rewardTiersIdsToDelete) });
      });
      canceled = true;
    }

    return {
      id: auction.id,
      canceled,
    };
  }

  async uploadAuctionLandingImages(
    userId: number,
    auctionId: number,
    promoImageFile: Express.Multer.File,
    backgroundImageFile: Express.Multer.File,
  ) {
    let auction = await this.validateAuctionPermissions(userId, auctionId);

    if (promoImageFile) {
      const uploadResult = await this.s3Service.uploadDocument(
        promoImageFile.path,
        `auctions/${promoImageFile.filename}`,
      );
      auction.promoImageUrl = uploadResult.url;
      await this.fileSystemService.removeFile(promoImageFile.path);
    }

    if (backgroundImageFile) {
      const uploadResult = await this.s3Service.uploadDocument(
        backgroundImageFile.path,
        `auctions/${backgroundImageFile.filename}`,
      );
      auction.backgroundImageUrl = uploadResult.url;
      await this.fileSystemService.removeFile(backgroundImageFile.path);
    }
    auction = await this.auctionRepository.save(auction);

    return classToPlain(auction);
  }

  private async getMyFutureAuctions(userId: number, limit: number, offset: number) {
    const now = new Date().toISOString();
    const [auctions, count] = await this.auctionRepository.findAndCount({
      where: {
        userId,
      },
      skip: offset,
      take: limit,
    });

    return { auctions, count };
  }

  private async getMyActiveAuctions(userId: number, limit: number, offset: number) {
    const now = new Date().toISOString();
    const [auctions, count] = await this.auctionRepository.findAndCount({
      where: {
        userId,
        startDate: LessThan(now),
        endDate: MoreThan(now),
      },
      skip: offset,
      take: limit,
    });

    return { auctions, count };
  }

  private async getMyPastAuctions(userId: number, limit: number, offset: number) {
    const now = new Date().toISOString();
    const [auctions, count] = await this.auctionRepository.findAndCount({
      where: {
        userId,
        endDate: LessThan(now),
      },
      skip: offset,
      take: limit,
    });

    return { auctions, count };
  }

  async getMyFutureAuctionsPage(userId: number, limit: number, offset: number) {
    const user = await this.usersService.getById(userId, true);
    const { count, auctions } = await this.getMyFutureAuctions(userId, limit, offset);
    const formattedAuctions = await this.formatMyAuctions(auctions);

    return {
      pagination: {
        total: count,
        offset,
        limit,
      },
      auctions: formattedAuctions,
    };
  }

  async getMyPastAuctionsPage(userId: number, limit: number, offset: number) {
    const user = await this.usersService.getById(userId, true);
    const { count, auctions } = await this.getMyPastAuctions(userId, limit, offset);
    const auctionsWithTiers = await this.formatMyAuctions(auctions);
    let auctionsWithBids = [];
    if (auctionsWithTiers.length) {
      auctionsWithBids = await this.attachBidsInfo(auctionsWithTiers);
    }

    return {
      pagination: {
        total: count,
        offset,
        limit,
      },
      auctions: auctionsWithBids,
    };
  }

  async getMyActiveAuctionsPage(userId: number, limit: number, offset: number) {
    const user = await this.usersService.getById(userId, true);
    const { count, auctions } = await this.getMyActiveAuctions(userId, limit, offset);
    const auctionsWithTiers = await this.formatMyAuctions(auctions);

    let auctionsWithBids = [];
    if (auctionsWithTiers.length) {
      auctionsWithBids = await this.attachBidsInfo(auctionsWithTiers);
    }

    return {
      pagination: {
        total: count,
        offset,
        limit,
      },
      auctions: auctionsWithBids,
    };
  }

  private async attachBidsInfo(auctions: Auction[]) {
    const auctionIds = auctions.map((auction) => auction.id);
    const bidsQuery = await this.auctionBidRepository
      .createQueryBuilder('bid')
      .select([
        'bid.auctionId',
        'MIN(bid.amount) as min',
        'MAX(bid.amount) as max',
        'SUM(bid.amount) as totalBidsAmount',
        'COUNT(*) as bidCount',
      ])
      .groupBy('bid.auctionId')
      .where('bid.auctionId IN (:...auctionIds)', { auctionIds: auctionIds })
      .getRawMany();

    return auctions.map((auction) => {
      const bid = bidsQuery.find((bid) => bid['bid_auctionId'] === auction.id);
      const bids = {
        bidsCount: 0,
        highestBid: 0,
        lowestBid: 0,
        totalBids: 0,
      };
      if (bid) {
        bids.bidsCount = +bid['bidcount'];
        bids.highestBid = +bid['max'];
        bids.lowestBid = +bid['min'];
        bids.totalBids = +bid['totalbidsamount'];
      } else {
      }
      return {
        ...auction,
        bids,
      };
    });
  }

  private async formatMyAuctions(auctions: Auction[]) {
    const auctionIds = auctions.map((auction) => auction.id);
    const rewardTiers = await this.rewardTierRepository.find({ where: { auctionId: In(auctionIds) } });
    const auctionRewardTiersMap = auctionIds.reduce((acc, auctionId) => {
      const prevRewardTiers = acc[auctionId] || [];
      return {
        ...acc,
        [auctionId]: [...prevRewardTiers, ...rewardTiers.filter((rewardTier) => rewardTier.auctionId === auctionId)],
      };
    }, {} as Record<string, RewardTier[]>);
    const rewardTierNfts = await this.rewardTierNftRepository.find({
      where: { rewardTierId: In(rewardTiers.map((rewardTier) => rewardTier.id)) },
    });

    const nfts = await this.nftRepository.find({
      where: { id: In(rewardTierNfts.map((rewardTierNft) => rewardTierNft.nftId)) },
    });

    const collections = await this.nftCollectionRepository.find({
      where: { id: In(nfts.map((nft) => nft.collectionId)) },
    });

    const idNftMap = nfts.reduce((acc, nft) => ({ ...acc, [nft.id]: nft }), {} as Record<string, Nft>);

    const rewardTierNftsMap = rewardTierNfts
      .sort((a, b) => (a.rewardTierId !== b.rewardTierId ? a.rewardTierId - b.rewardTierId : a.slot - b.slot))
      .reduce(function (acc, rewardTierNft) {
        return {
          ...acc,
          [rewardTierNft.rewardTierId]: [
            ...(acc[rewardTierNft.rewardTierId] || []),
            { ...idNftMap[rewardTierNft.nftId], slot: rewardTierNft.slot, deposited: rewardTierNft.deposited },
          ],
        };
      }, {} as Record<string, any[]>);

    return auctions.map((auction) => {
      let nfts = [];
      const rewardTiers = auctionRewardTiersMap[auction.id].map((rewardTier) => {
        nfts = rewardTierNftsMap[rewardTier.id].map((nft) => classToPlain(nft));
        return { ...classToPlain(rewardTier), nfts: nfts };
      });

      const auctionCollections = collections.filter((coll) => nfts.map((nft) => nft.collectionId).includes(coll.id));

      return {
        ...auction,
        rewardTiers: rewardTiers,
        collections: auctionCollections,
      };
    });
  }

  async updateAuctionExtraData(
    userId: number,
    auctionId: number,
    params: {
      headline: string;
      link: string;
      backgroundBlur: boolean;
    },
  ) {
    // const auction = await this.validateAuctionPermissions(userId, auctionId);
    //
    // auction.headline = params.headline ? params.headline : auction.headline;
    // auction.link = params.link ? params.link : auction.link;
    // auction.backgroundBlur = params.backgroundBlur ? params.backgroundBlur : auction.backgroundBlur;
    //
    // return await this.auctionRepository.save(auction);
  }

  async updateAuctionPromoImage(userId: number, auctionId: number, file: Express.Multer.File) {
    // const auction = await this.validateAuctionPermissions(userId, auctionId);
    //
    // await this.s3Service.uploadDocument(`${file.path}`, `${file.filename}`);
    //
    // auction.promoImage = file.filename;
    //
    // return await this.auctionRepository.save(auction);
  }

  async updateAuctionBackgroundImage(userId: number, auctionId: number, file: Express.Multer.File) {
    // const auction = await this.validateAuctionPermissions(userId, auctionId);
    //
    // auction.backgroundImage = file.filename;
    //
    // return await this.auctionRepository.save(auction);
  }

  async getAuction(id: number) {
    // const auction = await this.auctionRepository.findOne({ where: { id: id } });
    // if (!auction) return;
    //
    // const rewardTiers = await this.rewardTierRepository.find({
    //   where: { auctionId: auction.id },
    //   order: { tierPosition: 'ASC' },
    // });
    //
    // for (const rewardTier of rewardTiers) {
    //   const nftsInTier = await this.rewardTierNftRepository.find({ where: { rewardTierId: rewardTier.id } });
    //   const nftIdsInTier = [];
    //   for (const nftInTier of nftsInTier) {
    //     nftIdsInTier.push(nftInTier.nftId);
    //   }
    //   const nftsInfo = await this.nftRepository.find({ where: { tokenId: In(nftIdsInTier) } });
    //
    //   //Todo: group nfts from the same edition?
    //   rewardTier.nfts = nftsInfo;
    //   auction.rewardTiers.push(rewardTier);
    // }
  }

  async listAuctionsByUser(userId: number, page = 1, limit = 10) {
    // const auctionsQuery = this.auctionRepository.createQueryBuilder().where('userId = :userId', { userId });
    // const countQuery = auctionsQuery.clone();
    //
    // const auctionCount = await countQuery.select('count(*) as auction_count').getRawOne();
    //
    // this.setPagination(auctionsQuery, page, limit);
    // const auctions = await auctionsQuery.getMany();
    //
    // return {
    //   count: auctionCount['auctionCount'],
    //   data: auctions,
    // };
  }

  async listAuctionsByUserAndStatus(userId: number, status: string, page = 1, limit = 10) {
    const auctionsQuery = this.auctionRepository.createQueryBuilder();

    if (status == AuctionStatus.draft) {
      auctionsQuery.where('userId = :userId and now() < startDate', { userId });
    } else if (status == AuctionStatus.active) {
      auctionsQuery.where('userId = :userId and startDate < now() and now() < endDate', { userId });
    } else if (status == AuctionStatus.closed) {
      auctionsQuery.where('userId = :userId and endDate < now()', { userId });
    } else {
      return {
        count: 0,
        data: [],
      };
    }

    const countQuery = auctionsQuery.clone();
    const auctionCount = await countQuery.select('count(*) as auction_count').getRawOne();

    this.setPagination(auctionsQuery, page, limit);
    const auctions = await auctionsQuery.getMany();

    return {
      count: auctionCount['auctionCount'],
      data: auctions,
    };
  }

  async listAuctions(page = 1, limit = 10) {
    const auctionsQuery = this.auctionRepository.createQueryBuilder();
    const countQuery = auctionsQuery.clone();

    const auctionCount = await countQuery.select('count(*) as auction_count').getRawOne();

    this.setPagination(auctionsQuery, page, limit);
    const auctions = await auctionsQuery.getMany();

    return {
      count: auctionCount['auctionCount'],
      data: auctions,
    };
  }

  async listAuctionsByStatus(status: string, page = 1, limit = 10) {
    const auctionsQuery = this.auctionRepository.createQueryBuilder();

    if (status == AuctionStatus.draft) {
      auctionsQuery.where('now() < startDate');
    } else if (status == AuctionStatus.active) {
      auctionsQuery.where('startDate < now() and now() < endDate');
    } else if (status == AuctionStatus.closed) {
      auctionsQuery.where('endDate < now()');
    } else {
      return {
        count: 0,
        data: [],
      };
    }

    const countQuery = auctionsQuery.clone();
    const auctionCount = await countQuery.select('count(*) as auction_count').getRawOne();

    this.setPagination(auctionsQuery, page, limit);
    const auctions = await auctionsQuery.getMany();

    return {
      count: auctionCount['auctionCount'],
      data: auctions,
    };
  }

  public async getUserBids(userId: number) {
    //TODO: Add Pagination as this request can get quite computation heavy

    // User should have only one bid per auction -> if user places multiple bids their amount should be accumulated into a single bid (That's how smart contract works)
    const bids = await this.auctionBidRepository.find({ where: { userId: userId }, order: { createdAt: 'DESC' } });
    const auctionIds = bids.map((bid) => bid.auctionId);

    const [auctions, rewardTiers, bidsQuery] = await Promise.all([
      this.auctionRepository
        .createQueryBuilder('auction')
        .leftJoinAndMapOne('auction.creator', User, 'creator', 'creator.id = auction.userId')
        .where('auction.id IN (:...auctionIds)', { auctionIds: auctionIds })
        .getMany(),
      this.rewardTierRepository.find({ where: { auctionId: In(auctionIds) } }),
      this.auctionBidRepository
        .createQueryBuilder('bid')
        .select(['bid.auctionId', 'MIN(bid.amount) as min', 'MAX(bid.amount) as max', 'COUNT(*) as bidCount'])
        .groupBy('bid.auctionId')
        .where('bid.auctionId IN (:...auctionIds)', { auctionIds: auctionIds })
        .getRawMany(),
    ]);

    const rewardTiersNfts = await this.rewardTierNftRepository.find({
      where: { rewardTierId: In(rewardTiers.map((nft) => nft.id)) },
    });

    const rewardTierNftsByRewardTierId = rewardTiersNfts.reduce((acc, rewardTierNft) => {
      const group = acc[rewardTierNft.rewardTierId] || [];
      group.push(rewardTierNft);
      acc[rewardTierNft.rewardTierId] = group;
      return acc;
    }, {});

    const rewardTiersByAuctionId = rewardTiers.reduce((acc, tier) => {
      const group = acc[tier.auctionId] || [];
      group.push(tier);
      acc[tier.auctionId] = group;
      return acc;
    }, {});

    const auctionsById = auctions.reduce((acc, auction) => {
      acc[auction.id] = auction;
      return acc;
    }, {});

    const mappedBids = bids.map((bid) => {
      const bidResult = bidsQuery.find((b) => b['bid_auctionId'] === bid.auctionId);
      const auctionBidsCount = +bidResult['bidcount'];
      const highestBid = +bidResult['max'];
      const lowestBid = +bidResult['min'];
      const tiers = rewardTiersByAuctionId[bid.auctionId];

      // If auction has 5 winning slots but received only one bid -> numberOfWinners should be 1)
      const totalAuctionNumberOfWinners = tiers.reduce((acc, tier) => (acc += tier.numberOfWinners), 0);
      const numberOfWinners = Math.min(totalAuctionNumberOfWinners, auctionBidsCount);

      const tierNftIds = Object.keys(rewardTierNftsByRewardTierId).map((key) => +key);
      const nftsBySlot = rewardTiersNfts
        .filter((tierNft) => tierNftIds.includes(tierNft.rewardTierId))
        .reduce((acc, item) => {
          const group = acc[item.slot] || [];
          group.push(item);
          acc[item.slot] = group;
          return acc;
        }, {});

      let maxNfts = Number.MIN_SAFE_INTEGER;
      let minNfts = Number.MAX_SAFE_INTEGER;

      Object.keys(nftsBySlot).forEach((slot) => {
        if (nftsBySlot[slot].length > maxNfts) {
          maxNfts = nftsBySlot[slot].length;
        }
        if (nftsBySlot[slot].length < minNfts) {
          minNfts = nftsBySlot[slot].length;
        }
      });

      return {
        bid: classToPlain(bid),
        auction: classToPlain(auctionsById[bid.auctionId]),
        highestBid,
        lowestBid,
        numberOfWinners,
        maxNfts,
        minNfts,
      };
    });
    return { bids: mappedBids, pagination: {} };
  }

  public async placeAuctionBid(userId: number, placeBidBody: PlaceBidBody) {
    //TODO: This is a temporary endpoint until the scraper functionality is finished
    const auction = await this.auctionRepository.findOne(placeBidBody.auctionId);

    if (!auction) {
      throw new AuctionNotFoundException();
    }

    const bidder = await this.usersService.getById(userId);

    const bid = await this.auctionBidRepository.findOne({
      where: { userId, auctionId: placeBidBody.auctionId },
    });

    if (bid) {
      await this.auctionBidRepository.update(bid.id, {
        amount: +bid.amount + +placeBidBody.amount,
      });
    } else {
      await this.auctionBidRepository.save({
        userId: userId,
        amount: placeBidBody.amount,
        auctionId: placeBidBody.auctionId,
      });
    }
    const response = { ...placeBidBody, user: bidder };
    // this.gateway.notifyBids(placeBidBody.auctionId, response);

    return {
      bid: response,
    };
  }

  public async cancelAuctionBid(userId: number, auctionId: number) {
    //TODO: This is a temporary endpoint until the scraper functionality is finished
    await this.validateAuctionPermissions(userId, auctionId);

    const bid = await this.auctionBidRepository.findOne({
      where: { userId, auctionId: auctionId },
    });

    if (bid) {
      const deleteResult = await this.auctionBidRepository.delete(bid.id);
      return {
        deleted: deleteResult.affected,
      };
    }

    throw new AuctionBidNotFoundException();
  }

  private setPagination(query, page: number, limit: number) {
    if (limit === 0 || page === 0) return;

    query.limit(limit).offset((page - 1) * limit);
  }

  public async changeAuctionStatus(userId: number, changeAuctionStatusBody: ChangeAuctionStatus) {
    //TODO: This is a temporary endpoint until the scraper functionality is finished
    let auction = await this.validateAuctionPermissions(userId, changeAuctionStatusBody.auctionId);

    changeAuctionStatusBody.statuses.forEach((status) => {
      auction[status.name] = status.value;
    });

    auction = await this.auctionRepository.save(auction);

    // this.gateway.notifyAuctionStatus(auction);

    return {
      auction,
    };
  }
}
