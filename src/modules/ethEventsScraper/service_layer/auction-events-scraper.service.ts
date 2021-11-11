import { Connection, EntityManager, In, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';

import { AuctionCreatedEvent } from '../domain/create-auction-event';
import { Auction } from '../../auction/domain/auction.entity';
import { Erc721DepositedEvent } from '../domain/deposited-erc721-event';
import { Nft } from 'src/modules/nft/domain/nft.entity';
import { NftCollection } from 'src/modules/nft/domain/collection.entity';
import { RewardTierNft } from 'src/modules/auction/domain/reward-tier-nft.entity';
import { RewardTier } from 'src/modules/auction/domain/reward-tier.entity';
import { MarkRewardTierNftAsDepositedException } from './exceptions';
import { AuctionCanceledEvent } from '../domain/auction-canceled-event';

@Injectable()
export class AuctionEventsScraperService {
  private logger = new Logger(AuctionEventsScraperService.name);
  processing = false;

  constructor(
    @InjectRepository(AuctionCreatedEvent)
    private auctionCreatedEventRepository: Repository<AuctionCreatedEvent>,
    @InjectRepository(Erc721DepositedEvent)
    private erc721DepositedEventRepository: Repository<Erc721DepositedEvent>,
    @InjectRepository(AuctionCanceledEvent)
    private auctionCanceledEventRepository: Repository<AuctionCanceledEvent>,
    private connection: Connection,
  ) {}

  @Cron('*/9 * * * * *')
  public async syncAuctionEvents() {
    this.logger.log('start');
    try {
      if (this.processing) return;
      this.processing = true;
      await this.syncAuctionCreatedEvents();
      await this.syncAuctionsCanceledEvents();
      await this.syncErc721DepositedEvents();
      this.processing = false;
    } catch (e) {
      this.processing = false;
      console.error(e);
    }
    this.logger.log('end');
  }

  private async syncAuctionCreatedEvents() {
    const events = await this.auctionCreatedEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} AuctionCreated events`);

    for (const event of events) {
      await this.connection
        .transaction(async (transactionalEntityManager) => {
          const auction = await transactionalEntityManager.findOne(Auction, {
            where: { createAuctionTxHash: event.tx_hash },
          });

          if (!auction) {
            this.logger.warn(`auction not found with createAuctionTxHash ${event.tx_hash}`);
            return;
          }

          auction.onChain = true;
          auction.onChainId = event.data?.auctionId;
          auction.owner = event.data?.auctionOwner?.toLowerCase();
          auction.onChainStartTime = event.data?.startTime && event.data?.startTime.toString();
          auction.onChainEndTime = event.data?.endTime && event.data?.endTime.toString();
          auction.canceled = false;
          await transactionalEntityManager.save(auction);

          event.processed = true;
          await transactionalEntityManager.save(event);
        })
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  private async syncAuctionsCanceledEvents() {
    const events = await this.auctionCanceledEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} AuctionCanceled events`);

    for (const event of events) {
      await this.connection
        .transaction(async (transactionalEntityManager) => {
          const auction = await transactionalEntityManager.findOne(Auction, {
            where: { onChainId: event.data?.auctionId },
          });

          if (!auction) {
            this.logger.warn(`auction not found with auctionId ${event.data.auctionId}`);
            return;
          }

          auction.canceled = true;
          await transactionalEntityManager.save(auction);

          event.processed = true;
          await transactionalEntityManager.save(event);
        })
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  private async syncErc721DepositedEvents() {
    const events = await this.erc721DepositedEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} Erc721Deposited events`);

    for (const event of events) {
      await this.connection
        .transaction(async (transactionalEntityManager) => {
          const auction = await transactionalEntityManager.findOne(Auction, {
            where: { onChainId: event.data.auctionId },
          });

          if (!auction) {
            this.logger.warn(`auction not found with auctionId ${event.data.auctionId}`);
            return;
          }

          auction.depositedNfts = true;
          await transactionalEntityManager.save(auction);

          await this.markRewardTierNftAsDeposited(transactionalEntityManager, event);

          event.processed = true;
          await transactionalEntityManager.save(event);
        })
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  private async markRewardTierNftAsDeposited(transactionalEntityManager: EntityManager, event: Erc721DepositedEvent) {
    const collection = await transactionalEntityManager.findOne(NftCollection, {
      where: { address: event.data?.tokenAddress?.toLowerCase() },
    });

    if (!collection) throw new MarkRewardTierNftAsDepositedException('Collection not found');

    const nft = await transactionalEntityManager.findOne(Nft, {
      where: { collectionId: collection.id, tokenId: event.data?.tokenId },
    });
    if (!nft) throw new MarkRewardTierNftAsDepositedException('Nft not found');

    const rewardTiers = await transactionalEntityManager.find(RewardTier, {
      where: { auctionId: event.data?.auctionId },
    });
    if (rewardTiers.length === 0) throw new MarkRewardTierNftAsDepositedException('Reward Tiers not found');

    await transactionalEntityManager.update(
      RewardTierNft,
      {
        rewardTierId: In(rewardTiers.map((rewardTier) => rewardTier.id)),
        nftId: nft.id,
        slot: event.data?.slotIndex,
      },
      { deposited: true },
    );
  }
}
