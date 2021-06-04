import { Injectable } from '@nestjs/common';
import { getManager, Repository } from 'typeorm';
import { RewardTier } from '../domain/reward-tier.entity';
import { RewardTierNft } from '../domain/reward-tier-nft.entity';
import { Nft } from '../../nft/domain/nft.entity';
import { Auction } from '../domain/auction.entity';
import { ApiInternalServerErrorResponse } from '@nestjs/swagger';

@Injectable()
export class AuctionService {
  constructor(
    private rewardTierRepository: Repository<RewardTier>,
    private rewardTierNftRepository: Repository<RewardTierNft>,
    private auctionRepository: Repository<Auction>,
    private nftRepository: Repository<Nft>,

  ) { }

  async createRewardTier(
    userId: number,
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

  private async validateTierPermissions(userId: number, auctionId: number, tierdId: number){
    const tier = await this.rewardTierRepository.findOne({where: {id: tierdId}});
    if (!tier) {
      //return tier not found
    }

    if (tier.auctionId !== auctionId) {
      //return error if mismatch
    }

    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });

    if (!auction) {
      //return auction not found
    }

    if (userId !== auction.userId) {
      //return error if missmatch
    }

    return {tier, auction}
  }

  async updateRewardTier(userId: number, auctionId: number, tierdId: number, customDescription: string, tierColor: string) {
    const {tier, auction} = await this.validateTierPermissions(userId, auctionId, tierdId);

    tier.customDescription = customDescription;
    tier.tierColor = tierColor;
    await this.rewardTierRepository.save(tier);
  }

  async updateRewardTierImage(userId: number, auctionId: number, tierdId: number, file: Express.Multer.File) {
    const {tier, auction} = await this.validateTierPermissions(userId, auctionId, tierdId);

    // await this.s3Service.uploadDocument(
    //   `${file.path}`,
    //   `${file.filename}`,
    // );

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

  async updateAuction(userId: number, auctionId: number, name: string, startDate: Date, endDate: Date, bidCurrency: string, startingBid: number) {
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });

    if (!auction) {
      //return auction not found
    }

    if (userId !== auction.userId) {
      //return error if missmatch
    }

    auction.name = name;
    auction.startDate = startDate;
    auction.endDate = endDate;
    auction.bidCurrency = bidCurrency;
    auction.startingBid = startingBid;

    return await this.auctionRepository.save(auction);
  }
}
