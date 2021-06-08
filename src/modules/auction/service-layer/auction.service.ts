import { Injectable } from '@nestjs/common';
import { getManager, Repository } from 'typeorm';
import { RewardTier } from '../domain/reward-tier.entity';
import { RewardTierNft } from '../domain/reward-tier-nft.entity';
import { Auction } from '../domain/auction.entity';
import { S3Service } from '../../file-storage/s3.service';
import { AppConfig } from 'src/modules/configuration/configuration.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAuctionBodyParams, UpdateAuctionExtraBodyParams } from '../entrypoints/dto'
@Injectable()
export class AuctionService {
  constructor(
    @InjectRepository(RewardTier)
    private rewardTierRepository: Repository<RewardTier>,
    @InjectRepository(RewardTierNft)
    private rewardTierNftRepository: Repository<RewardTierNft>,
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
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
    const tier = await this.rewardTierRepository.findOne({where: {userId, auctionId, tierPosition: params.tierPosition}});
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
    name: string,
    numberOfWinners: number,
    nftsPerWinner: number,
    nftIds: number[],
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

        tier.name = name;
        tier.numberOfWinners = numberOfWinners;
        tier.nftsPerWinner = nftsPerWinner;
        await transactionalEntityManager.save(tier);

        await transactionalEntityManager.createQueryBuilder().delete().from(RewardTierNft).where('rewardTierId = :tierId', { tierId: tier.id }).execute();

        const rewardTierNfts = nftIds.map((nftId) =>
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

  async updateRewardTierExtraData(userId: number, tierId: number, customDescription: string, tierColor: string) {
    const tier = await this.validateTierPermissions(userId, tierId);

    tier.customDescription = customDescription;
    tier.tierColor = tierColor;
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
  }) {
    console.log(userId, auctionId, params)
    const auction = await this.validateAuctionPermissions(userId, auctionId);

    auction.name = params.name ? params.name : auction.name;
    auction.startDate = params.startDate ? params.startDate : auction.startDate;
    auction.endDate = params.endDate ? params.endDate : auction.endDate;
    auction.bidCurrency = params.bidCurrency ? params.bidCurrency : auction.bidCurrency;
    auction.startingBid = params.startingBid ? params.startingBid : auction.startingBid;

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

  async listAuctions(userId: number) {
    const auctions = await this.auctionRepository.find({ where: { userId } });

    return auctions;
  }
}
