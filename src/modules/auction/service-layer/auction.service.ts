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
  DeployAuctionBody,
  EditAuctionBody,
  UpdateRewardTierBody,
  DepositNftsBody,
  PlaceBidBody,
} from '../entrypoints/dto';
import { Nft } from 'src/modules/nft/domain/nft.entity';
import { AuctionNotFoundException } from './exceptions/AuctionNotFoundException';
import { AuctionBadOwnerException } from './exceptions/AuctionBadOwnerException';
import { FileSystemService } from '../../file-system/file-system.service';
import { RewardTierNotFoundException } from './exceptions/RewardTierNotFoundException';
import { RewardTierBadOwnerException } from './exceptions/RewardTierBadOwnerException';
import { UsersService } from '../../users/users.service';
import { classToPlain } from 'class-transformer';
import { UploadResult } from 'src/modules/file-storage/model/UploadResult';
import { NftCollection } from 'src/modules/nft/domain/collection.entity';
import { AuctionBid } from '../domain/auction.bid.entity';
import { User } from 'src/modules/users/user.entity';

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
    private readonly config: AppConfig,
  ) {}

  async getAuctionPage(username: string, auctionName: string) {
    const artist = await this.usersService.getByUsername(username);
    const link = `universe.xyz/${username}/${auctionName}`;

    //TODO: add a check if the auction has started
    const auction = await this.auctionRepository.findOne({ link: link });

    if (!auction) {
      throw new AuctionNotFoundException();
    }

    // TODO: Add collection info for each nft
    const rewardTiers = await this.rewardTierRepository.find({ where: { auctionId: auction.id } });
    const rewardTierNfts = await this.rewardTierNftRepository.find({
      where: { rewardTierId: In(rewardTiers.map((rewardTier) => rewardTier.id)) },
    });

    const nftIds = rewardTierNfts.map((rewardTierNft) => rewardTierNft.nftId);
    // console.log(nftIds);

    const nfts = await this.nftRepository.find({ where: { id: In(nftIds) } });
    const nftCollectionids = nfts.map((nft) => nft.collectionId);

    const collections = await this.nftCollectionRepository.find({ id: In(nftCollectionids) });
    const idNftMap = nfts.reduce((acc, nft) => ({ ...acc, [nft.id]: nft }), {} as Record<string, Nft>);
    // console.log(idNftMap);
    const rewardTierNftsMap = rewardTierNfts.reduce(
      (acc, rewardTierNft) => ({
        ...acc,
        [rewardTierNft.rewardTierId]: [...(acc[rewardTierNft.rewardTierId] || []), idNftMap[rewardTierNft.nftId]],
      }),
      {} as Record<string, Nft[]>,
    );

    //TODO: Filter to return only active auctions
    const moreActiveAuctions = await this.auctionRepository.find({ where: { userId: artist.id, id: Not(auction.id) } });

    // const bids = await this.auctionBidRepository.find({ where: { auctionId: auction.id } });
    const bids = await this.auctionBidRepository
      .createQueryBuilder('bid')
      .leftJoinAndMapOne('bid.user', User, 'bidder', 'bidder.id = bid.userId')
      .where({ auctionId: auction.id })
      .orderBy('bid.amount', 'DESC')
      .getMany();

    return {
      auction: auction,
      artist: classToPlain(artist),
      collections: classToPlain(collections),
      rewardTiers: rewardTiers.map((rewardTier) => ({
        ...classToPlain(rewardTier),
        nfts: rewardTierNftsMap[rewardTier.id].map((nft) => classToPlain(nft)),
      })),
      moreActiveAuctions: moreActiveAuctions.map((a) => classToPlain(a)),
      bids: bids,
    };
  }

  async createRewardTier(
    userId: number,
    auctionId: number,
    params: {
      name: string;
      numberOfWinners: number;
      nftsPerWinner: number;
      nftIds: number[];
      minimumBid: number;
      tierPosition: number;
    },
  ) {
    const tier = await this.rewardTierRepository.findOne({
      where: { userId, auctionId, tierPosition: params.tierPosition },
    });
    if (tier) return tier;

    return await getManager().transaction('SERIALIZABLE', async (transactionalEntityManager) => {
      const tier = this.rewardTierRepository.create({
        userId,
        auctionId,
        name: params.name,
        nftsPerWinner: params.nftsPerWinner,
        numberOfWinners: params.numberOfWinners,
        minimumBid: params.minimumBid,
        tierPosition: params.tierPosition,
      });
      await transactionalEntityManager.save(tier);

      const rewardTierNfts = params.nftIds.map((nftId) =>
        this.rewardTierNftRepository.create({
          rewardTierId: tier.id,
          nftId: nftId,
        }),
      );

      await Promise.all(rewardTierNfts.map((rewardTierNft) => this.rewardTierNftRepository.save(rewardTierNft)));

      return tier;
    });
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

  public async withdrawNfts(userId: number, withdrawNftsBody: DepositNftsBody) {
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

  async getMyActiveAuctionsPage(userId: number, limit: number, offset: number) {
    const user = await this.usersService.getById(userId, true);
    const { count, auctions } = await this.getMyActiveAuctions(userId, limit, offset);
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
            { ...idNftMap[rewardTierNft.nftId], slot: rewardTierNft.slot },
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

  public async getAuctionBids(auctionId: number) {
    //TODO: Add results limit to get only (reward tiers * reward tier slots)
    const bids = await this.auctionBidRepository.find({ where: { auctionId: auctionId }, order: { amount: 'DESC' } });

    return {
      bids: bids.map((bid) => classToPlain(bid)),
    };
  }

  public async placeAuctionBid(userId: number, placeBidBody: PlaceBidBody) {
    //TODO: This is a temporartu endpoint until the scraper functionality is finished
    const bidder = await this.usersService.getById(userId);
    const auction = await this.auctionRepository.findOne(placeBidBody.auctionId);

    if (!auction) {
      throw new AuctionNotFoundException();
    }

    const bid = await this.auctionBidRepository.save({
      userId: userId,
      amount: placeBidBody.amount,
      auctionId: placeBidBody.auctionId,
    });

    const response = { ...bid, user: bidder };
    return {
      bid: response,
    };
  }

  private setPagination(query, page: number, limit: number) {
    if (limit === 0 || page === 0) return;

    query.limit(limit).offset((page - 1) * limit);
  }
}
