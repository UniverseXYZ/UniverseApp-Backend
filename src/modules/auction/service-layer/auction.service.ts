import { Injectable } from '@nestjs/common';
import { getManager, In, Repository, Transaction, TransactionRepository } from 'typeorm';
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
  UpdateAuctionBodyParams,
  UpdateAuctionExtraBodyParams,
} from '../entrypoints/dto';
import { Nft } from 'src/modules/nft/domain/nft.entity';
import { AuctionNotFoundException } from './exceptions/AuctionNotFoundException';
import { AuctionBadOwnerException } from './exceptions/AuctionBadOwnerException';
@Injectable()
export class AuctionService {
  constructor(
    @InjectRepository(RewardTier)
    private rewardTierRepository: Repository<RewardTier>,
    @InjectRepository(RewardTierNft)
    private rewardTierNftRepository: Repository<RewardTierNft>,
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    @InjectRepository(Nft)
    private nftRepository: Repository<Nft>,
    private s3Service: S3Service,
    private readonly config: AppConfig,
  ) {}

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

  async updateRewardTier(
    userId: number,
    tierId: number,
    params: {
      name: string;
      numberOfWinners: number;
      nftsPerWinner: number;
      nftIds: number[];
    },
  ) {
    return await getManager().transaction('SERIALIZABLE', async (transactionalEntityManager) => {
      const tier = await this.rewardTierRepository.findOne({ where: { id: tierId } });
      if (!tier) {
        //throw error
      }
      if (tier.userId !== userId) {
        //throw error
      }

      tier.name = params.name ? params.name : tier.name;
      tier.numberOfWinners = params.numberOfWinners ? params.numberOfWinners : tier.numberOfWinners;
      tier.nftsPerWinner = params.nftsPerWinner ? params.nftsPerWinner : tier.nftsPerWinner;

      await transactionalEntityManager.save(tier);

      if (params.nftIds) {
        const createdNfts = await this.rewardTierNftRepository.find({ where: { rewardTierId: tierId } });
        const createdNftIds = [];
        for (const nft of createdNfts) {
          createdNftIds.push(nft.nftId);
        }

        const idsToDelete = createdNftIds.filter((x) => !params.nftIds.includes(x));
        const idsToCreate = params.nftIds.filter((x) => !createdNftIds.includes(x));
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(RewardTierNft)
          .where('nftId IN (:...idsToDelete)', { idsToDelete })
          .execute();

        const rewardTierNfts = idsToCreate.map((nftId) =>
          this.rewardTierNftRepository.create({
            rewardTierId: tier.id,
            nftId: nftId,
          }),
        );

        await Promise.all(rewardTierNfts.map((rewardTierNft) => this.rewardTierNftRepository.save(rewardTierNft)));
      }

      return tier;
    });
  }

  private async validateTierPermissions(userId: number, tierId: number) {
    const tier = await this.rewardTierRepository.findOne({ where: { id: tierId } });
    if (!tier) {
      //return tier not found
    }

    if (userId !== tier.userId) {
      //return error if missmatch
    }

    return tier;
  }

  async updateRewardTierExtraData(
    userId: number,
    tierId: number,
    params: { customDescription: string; tierColor: string },
  ) {
    const tier = await this.validateTierPermissions(userId, tierId);

    tier.customDescription = params.customDescription ? params.customDescription : tier.customDescription;
    tier.tierColor = params.tierColor ? params.tierColor : tier.tierColor;
    await this.rewardTierRepository.save(tier);
    return tier;
  }

  async updateRewardTierImage(userId: number, tierId: number, file: Express.Multer.File) {
    const tier = await this.validateTierPermissions(userId, tierId);

    await this.s3Service.uploadDocument(`${file.path}`, `${file.filename}`);

    tier.tierImageUrl = file.filename;
    await this.rewardTierRepository.save(tier);
    return tier;
  }

  @Transaction()
  async createAuction(
    userId: number,
    createAuctionBody: CreateAuctionBody,
    @TransactionRepository(RewardTier) rewardTierRepository?: Repository<RewardTier>,
    @TransactionRepository(RewardTierNft) rewardTierNftRepository?: Repository<RewardTierNft>,
    @TransactionRepository(Auction) auctionRepository?: Repository<Auction>,
  ) {
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

      for (const id of rewardTierBody.nftIds) {
        const rewardTierNft = rewardTierNftRepository.create();
        rewardTierNft.nftId = id;
        rewardTierNft.rewardTierId = rewardTier.id;
        await rewardTierNftRepository.save(rewardTierNft);
      }
    }

    return {
      id: auction.id,
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

  async listAuctionsByUser(userId: number, page: number = 1, limit: number = 10) {
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

  async listAuctionsByUserAndStatus(userId: number, status: string, page: number = 1, limit: number = 10) {
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

  async listAuctions(page: number = 1, limit: number = 10) {
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

  async listAuctionsByStatus(status: string, page: number = 1, limit: number = 10) {
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

  private setPagination(query, page: number, limit: number) {
    if (limit === 0 || page === 0) return;

    query.limit(limit).offset((page - 1) * limit);
  }
}
