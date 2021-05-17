import { Injectable } from '@nestjs/common';
import { getManager, Repository } from 'typeorm';
import { RewardTier } from '../domain/reward-tier.entity';
import { RewardTierNft } from '../domain/reward-tier-nft';
import { Nft } from '../../nft/domain/nft.entity';

@Injectable()
export class AuctionService {
  constructor(
    private rewardTierRepository: Repository<RewardTier>,
    private rewardTierNftRepository: Repository<RewardTierNft>,
    private nftRepository: Repository<Nft>,
  ) {}

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
}
