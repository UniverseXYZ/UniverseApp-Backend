import { Injectable } from '@nestjs/common';
import { getManager, In, Repository } from 'typeorm';
import { RewardTier } from '../domain/reward-tier.entity';
import { RewardTierNft } from '../domain/reward-tier-nft.entity';
import { Auction } from '../domain/auction.entity';
import { S3Service } from '../../file-storage/s3.service';
import { AppConfig } from 'src/modules/configuration/configuration.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AuctionStatus } from '../domain/types'
import { UpdateAuctionBodyParams, UpdateAuctionExtraBodyParams } from '../entrypoints/dto'
import { Nft } from 'src/modules/nft/domain/nft.entity';
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
  ) { }

  async createRewardTier(
    userId: number,
    auctionId: number,
    params: {
      name: string,
      numberOfWinners: number,
      nftsPerWinner: number,
      nftIds: number[],
      minimumBid: number,
      tierPosition: number;
    }
  ) {
    const tier = await this.rewardTierRepository.findOne({ where: { userId, auctionId, tierPosition: params.tierPosition } });
    if (tier) return tier;

    return await getManager().transaction(
      'SERIALIZABLE',
      async (transactionalEntityManager) => {
        const tier = this.rewardTierRepository.create({
          userId,
          auctionId,
          name: params.name,
          nftsPerWinner: params.nftsPerWinner,
          numberOfWinners: params.numberOfWinners,
          minimumBid: params.minimumBid,
          tierPosition: params.tierPosition
        });
        await transactionalEntityManager.save(tier);

        const rewardTierNfts = params.nftIds.map((nftId) =>
          this.rewardTierNftRepository.create({
            rewardTierId: tier.id,
            nftId: nftId,
          }),
        );

        await Promise.all(
          rewardTierNfts.map((rewardTierNft) =>
            this.rewardTierNftRepository.save(rewardTierNft),
          ),
        );

        return tier;
      },
    );
  }

  async updateRewardTier(
    userId: number,
    tierId: number,
    params: {
      name: string,
      numberOfWinners: number,
      nftsPerWinner: number,
      nftIds: number[],
    }
  ) {
    return await getManager().transaction(
      'SERIALIZABLE',
      async (transactionalEntityManager) => {
        const tier = await this.rewardTierRepository.findOne({ where: { id: tierId } })
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

          const idsToDelete = createdNftIds.filter(x => !params.nftIds.includes(x));
          const idsToCreate = params.nftIds.filter(x => !createdNftIds.includes(x));
          await transactionalEntityManager.createQueryBuilder().delete().from(RewardTierNft).where('nftId IN (:...idsToDelete)', { idsToDelete }).execute();

          const rewardTierNfts = idsToCreate.map((nftId) =>
            this.rewardTierNftRepository.create({
              rewardTierId: tier.id,
              nftId: nftId,
            }),
          );

          await Promise.all(
            rewardTierNfts.map((rewardTierNft) =>
              this.rewardTierNftRepository.save(rewardTierNft),
            ),
          );
        }

        return tier;
      },
    );
  }

  private async validateTierPermissions(userId: number, tierId: number) {
    const tier = await this.rewardTierRepository.findOne({ where: { id: tierId } });
    if (!tier) {
      //return tier not found
    }

    if (userId !== tier.userId) {
      //return error if missmatch
    }

    return tier
  }

  async updateRewardTierExtraData(userId: number, tierId: number, params: { customDescription: string, tierColor: string }) {
    const tier = await this.validateTierPermissions(userId, tierId);

    tier.customDescription = params.customDescription ? params.customDescription : tier.customDescription;
    tier.tierColor = params.tierColor ? params.tierColor : tier.tierColor;
    await this.rewardTierRepository.save(tier);
    return tier;
  }

  async updateRewardTierImage(userId: number, tierId: number, file: Express.Multer.File) {
    const tier = await this.validateTierPermissions(userId, tierId);

    await this.s3Service.uploadDocument(
      `${file.path}`,
      `${file.filename}`,
    );

    tier.tierImage = file.filename;
    await this.rewardTierRepository.save(tier);
    return tier;
  }

  async createAuction(userId: number, name: string, startDate: Date, endDate: Date, bidCurrency: string, startingBid: number) {
    const auction = this.auctionRepository.create({
      userId,
      name,
      startDate,
      endDate,
      bidCurrency,
      startingBid
    });
    this.auctionRepository.save(auction);
  }

  private async validateAuctionPermissions(userId: number, auctionId: number) {
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });

    if (!auction) {
      //return auction not found
    }

    if (userId !== auction.userId) {
      //return error if missmatch
    }

    return auction
  }

  async updateAuction(userId: number, auctionId: number, params: {
    name: string;
    startDate: Date;
    endDate: Date;
    bidCurrency: string;
    startingBid: number;
    txHash: string
  }) {
    console.log(userId, auctionId, params)
    const auction = await this.validateAuctionPermissions(userId, auctionId);

    auction.name = params.name ? params.name : auction.name;
    auction.startDate = params.startDate ? params.startDate : auction.startDate;
    auction.endDate = params.endDate ? params.endDate : auction.endDate;
    auction.bidCurrency = params.bidCurrency ? params.bidCurrency : auction.bidCurrency;
    auction.startingBid = params.startingBid ? params.startingBid : auction.startingBid;
    auction.txHash = params.txHash ? params.txHash : auction.txHash;

    return await this.auctionRepository.save(auction);
  }

  async updateAuctionExtraData(userId: number, auctionId: number, params: {
    headline: string;
    link: string;
    backgroundBlur: boolean;
  }) {
    const auction = await this.validateAuctionPermissions(userId, auctionId);

    auction.headline = params.headline ? params.headline : auction.headline;
    auction.link = params.link ? params.link : auction.link;
    auction.backgroundBlur = params.backgroundBlur ? params.backgroundBlur : auction.backgroundBlur;

    return await this.auctionRepository.save(auction);
  }

  async updateAuctionPromoImage(userId: number, auctionId: number, file: Express.Multer.File) {
    const auction = await this.validateAuctionPermissions(userId, auctionId);

    await this.s3Service.uploadDocument(
      `${file.path}`,
      `${file.filename}`,
    );

    auction.promoImage = file.filename;

    return await this.auctionRepository.save(auction);
  }

  async updateAuctionBackgroundImage(userId: number, auctionId: number, file: Express.Multer.File) {
    const auction = await this.validateAuctionPermissions(userId, auctionId);

    auction.backgroundImage = file.filename;

    return await this.auctionRepository.save(auction);
  }

  async getAuction(id: number) {
    const auction = await this.auctionRepository.findOne({ where: { id: id } });
    if (!auction) return;

    const rewardTiers = await this.rewardTierRepository.find({where: {auctionId: auction.id}, order: {tierPosition: 'ASC'}});

    for (const rewardTier of rewardTiers) {
      const nftsInTier = await this.rewardTierNftRepository.find({where: {rewardTierId: rewardTier.id}});
      const nftIdsInTier = [];
      for (const nftInTier of nftsInTier) {
        nftIdsInTier.push(nftInTier.nftId);
      }
      const nftsInfo = await this.nftRepository.find({where : {tokenId: In(nftIdsInTier)}});

      //Todo: group nfts from the same edition?
      rewardTier.nfts = nftsInfo
      auction.rewardTiers.push(rewardTier);
    }

  }

  async listAuctionsByUser(userId: number, page: number = 1, limit: number = 10) {
    const auctionsQuery = this.auctionRepository.createQueryBuilder().where('userId = :userId', { userId });
    const countQuery = auctionsQuery.clone();

    const auctionCount = await countQuery
      .select("count(*) as auction_count")
      .getRawOne();

    this.setPagination(auctionsQuery, page, limit);
    const auctions = await auctionsQuery.getMany();

    return {
      count: auctionCount['auctionCount'],
      data: auctions
    };
  }

  async listAuctionsByUserAndStatus(userId: number, status: string, page: number = 1, limit: number = 10) {
    const auctionsQuery = this.auctionRepository.createQueryBuilder();

    if (status == AuctionStatus.draft) {
      auctionsQuery.where('userId = :userId and now() < startDate', { userId });
    } else
      if (status == AuctionStatus.active) {
        auctionsQuery.where('userId = :userId and startDate < now() and now() < endDate', { userId });
      } else
        if (status == AuctionStatus.closed) {
          auctionsQuery.where('userId = :userId and endDate < now()', { userId });
        } else {
          return {
            count: 0,
            data: []
          };
        }

    const countQuery = auctionsQuery.clone();
    const auctionCount = await countQuery
      .select("count(*) as auction_count")
      .getRawOne();

    this.setPagination(auctionsQuery, page, limit);
    const auctions = await auctionsQuery.getMany();

    return {
      count: auctionCount['auctionCount'],
      data: auctions
    };
  }

  async listAuctions(page: number = 1, limit: number = 10) {
    const auctionsQuery = this.auctionRepository.createQueryBuilder();
    const countQuery = auctionsQuery.clone();

    const auctionCount = await countQuery
      .select("count(*) as auction_count")
      .getRawOne();

    this.setPagination(auctionsQuery, page, limit);
    const auctions = await auctionsQuery.getMany();

    return {
      count: auctionCount['auctionCount'],
      data: auctions
    };
  }

  async listAuctionsByStatus(status: string, page: number = 1, limit: number = 10) {
    const auctionsQuery = this.auctionRepository.createQueryBuilder();

    if (status == AuctionStatus.draft) {
      auctionsQuery.where('now() < startDate');
    } else
      if (status == AuctionStatus.active) {
        auctionsQuery.where('startDate < now() and now() < endDate');
      } else
        if (status == AuctionStatus.closed) {
          auctionsQuery.where('endDate < now()');
        } else {
          return {
            count: 0,
            data: []
          };
        }

    const countQuery = auctionsQuery.clone();
    const auctionCount = await countQuery
      .select("count(*) as auction_count")
      .getRawOne();

    this.setPagination(auctionsQuery, page, limit);
    const auctions = await auctionsQuery.getMany();

    return {
      count: auctionCount['auctionCount'],
      data: auctions
    };
  }

  private setPagination(query, page: number, limit: number) {
    if (limit === 0 || page === 0) return;

    query.limit(limit).offset((page - 1) * limit);
  }
}
