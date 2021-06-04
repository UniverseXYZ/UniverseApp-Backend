import { Injectable } from '@nestjs/common';
import { getManager, Repository } from 'typeorm';
import { RewardTier } from '../domain/reward-tier.entity';
import { RewardTierNft } from '../domain/reward-tier-nft.entity';
import { Nft } from '../../nft/domain/nft.entity';
import { Auction } from '../domain/auction.entity';
import { ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { S3Service } from '../../file-storage/s3.service';
import { AppConfig } from 'src/modules/configuration/configuration.service';

@Injectable()
export class AuctionService {
  constructor(
    private rewardTierRepository: Repository<RewardTier>,
    private rewardTierNftRepository: Repository<RewardTierNft>,
    private auctionRepository: Repository<Auction>,
    private nftRepository: Repository<Nft>,
    private s3Service: S3Service,
    private readonly config: AppConfig,
  ) { }

  async createRewardTier(
    userId: number,
    auctionId: number,
    name: string,
    numberOfWinners: number,
    nftsPerWinner: number,
    nftIds: number[],
  ) {
    return await getManager().transaction(
      'SERIALIZABLE',
      async (transactionalEntityManager) => {
        const tier = this.rewardTierRepository.create({
          userId,
          name,
          nftsPerWinner,
          numberOfWinners,
          auctionId
        });
        await transactionalEntityManager.save(tier);

        const rewardTierNfts = nftIds.map((nftId) =>
          this.rewardTierNftRepository.create({
            rewardTierId: tier.id,
            nftId: nftId,
          }),
        );
        return await Promise.all(
          rewardTierNfts.map((rewardTierNft) =>
            this.rewardTierNftRepository.save(rewardTierNft),
          ),
        );
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
        const tier = await this.rewardTierRepository.findOne({where: {id: tierId}})
        if (!tier) {
          //throw error
        }
        if ( tier.userId !== userId ) {
          //throw error
        }

        tier.name = name;
        tier.numberOfWinners = numberOfWinners;
        tier.nftsPerWinner = nftsPerWinner;
        await transactionalEntityManager.save(tier);

        await transactionalEntityManager.createQueryBuilder().delete().from(RewardTierNft).where('rewardTierId = :tierId', {tierId: tier.id}).execute();

        const rewardTierNfts = nftIds.map((nftId) =>
          this.rewardTierNftRepository.create({
            rewardTierId: tier.id,
            nftId: nftId,
          }),
        );
        return await Promise.all(
          rewardTierNfts.map((rewardTierNft) =>
            this.rewardTierNftRepository.save(rewardTierNft),
          ),
        );
      },
    );
  }

  private async validateTierPermissions(userId: number, tierId: number){
    const tier = await this.rewardTierRepository.findOne({where: {id: tierId}});
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
  }

  async updateRewardTierImage(userId: number, tierId: number, file: Express.Multer.File) {
    const tier = await this.validateTierPermissions(userId, tierId);

    await this.s3Service.uploadDocument(
      `${file.path}`,
      `${file.filename}`,
    );

    tier.tierImage = file.filename;
    await this.rewardTierRepository.save(tier);
  }

  async createAuction(userId: number, name: string, startDate: Date, endDate: Date, bidCurrency: string, startingBid: number) {
    return await this.auctionRepository.create({
      userId,
      name,
      startDate,
      endDate,
      bidCurrency,
      startingBid
    });
  }

  private async validateAuctionPermissions(userId: number, auctionId: number){
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });

    if (!auction) {
      //return auction not found
    }

    if (userId !== auction.userId) {
      //return error if missmatch
    }

    return auction
  }

  async updateAuction(userId: number, auctionId: number, name: string, startDate: Date, endDate: Date, bidCurrency: string, startingBid: number) {
    const auction = await this.validateAuctionPermissions(userId, auctionId);

    auction.name = name;
    auction.startDate = startDate;
    auction.endDate = endDate;
    auction.bidCurrency = bidCurrency;
    auction.startingBid = startingBid;

    return await this.auctionRepository.save(auction);
  }

  async updateAuctionExtraData(userId: number, auctionId: number, headline: string, link: string, backgroundBlur: boolean) {
    const auction = await this.validateAuctionPermissions(userId, auctionId);

    auction.headline = headline;
    auction.link = link;
    auction.backgroundBlur = backgroundBlur;

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
}
