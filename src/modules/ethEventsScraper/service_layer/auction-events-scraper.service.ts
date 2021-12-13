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
import { MarkRewardTierNftAsDepositedException, MarkRewardTierNftAsWithdrawnException } from './exceptions';
import { AuctionCanceledEvent } from '../domain/auction-canceled-event';
import { AuctionGateway } from 'src/modules/auction/service-layer/auction.gateway';
import { Erc721WithdrawnEvent } from '../domain/withdrawn-erc721-event';
import { BidSubmittedEvent } from '../domain/submitted-bid-event';
import { AuctionBid } from 'src/modules/auction/domain/auction.bid.entity';
import { User } from 'src/modules/users/user.entity';
import { classToPlain } from 'class-transformer';
import { utils } from 'ethers';
import { CapturedRevenueEvent } from '../domain/captured-revenue-event';
import { Erc721ClaimedEvent } from '../domain/claimed-erc721-event';
import { AuctionExtendedEvent } from '../domain/extended-auction-event';
import { MatchedBidEvent } from '../domain/matched-bids-event';
import { BidWithdrawnEvent } from '../domain/withdrawn-bid-event';
import { WithdrawnRevenueEvent } from '../domain/withdrawn-revenue-event';

@Injectable()
export class AuctionEventsScraperService {
  private logger = new Logger(AuctionEventsScraperService.name);
  processing = false;

  constructor(
    @InjectRepository(AuctionCreatedEvent)
    private auctionCreatedEventRepository: Repository<AuctionCreatedEvent>,
    @InjectRepository(Auction)
    private auctionsRepository: Repository<Auction>,
    @InjectRepository(RewardTier)
    private rewardTiersRepository: Repository<RewardTier>,
    @InjectRepository(RewardTierNft)
    private rewardTierNftsRepository: Repository<RewardTierNft>,
    @InjectRepository(Erc721DepositedEvent)
    private erc721DepositedEventRepository: Repository<Erc721DepositedEvent>,
    @InjectRepository(BidSubmittedEvent)
    private bidSubmittedEventRepository: Repository<BidSubmittedEvent>,
    @InjectRepository(Erc721WithdrawnEvent)
    private erc721WithdrawEventRepository: Repository<Erc721WithdrawnEvent>,
    @InjectRepository(AuctionCanceledEvent)
    private auctionCanceledEventRepository: Repository<AuctionCanceledEvent>,
    @InjectRepository(CapturedRevenueEvent)
    private capturedRevenueEventRepository: Repository<CapturedRevenueEvent>,
    @InjectRepository(Erc721ClaimedEvent)
    private erc721ClaimedEventRepository: Repository<Erc721ClaimedEvent>,
    @InjectRepository(AuctionExtendedEvent)
    private auctionExtendedEventRepository: Repository<AuctionExtendedEvent>,
    @InjectRepository(MatchedBidEvent)
    private matchedBidEventRepository: Repository<MatchedBidEvent>,
    @InjectRepository(BidWithdrawnEvent)
    private bidWithdrawnEventRepository: Repository<BidWithdrawnEvent>,
    @InjectRepository(WithdrawnRevenueEvent)
    private withdrawnRevenueEventRepository: Repository<WithdrawnRevenueEvent>,

    private connection: Connection,
    private auctionGateway: AuctionGateway,
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
      await this.syncErc721WithdrawEvents();
      await this.syncBidSubmittedEvents();
      await this.syncBidWithdrawnEvents();
      await this.syncAuctionExtendedEvents();
      await this.syncBidMatchedEvents();
      await this.syncRevenueWithdrawnEvents();
      await this.syncRevenueCapturedEvents();
      await this.syncErc721ClaimedEvents();

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
          this.auctionGateway.notifyAuctionCreated(auction.id, auction.onChainId);
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
          this.auctionGateway.notifyAuctionCanceled(auction.id);
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

          await this.markRewardTierNftAsDeposited(transactionalEntityManager, event, auction.id);

          event.processed = true;
          await transactionalEntityManager.save(event);
          this.auctionGateway.notifyAuctionDepositedNfts(auction.id);
        })
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  private async syncErc721WithdrawEvents() {
    const events = await this.erc721WithdrawEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} Erc721Withdrawn events`);

    for (const event of events) {
      const auction = await this.auctionsRepository.findOne({
        where: { onChainId: event.data.auctionId },
      });

      await this.connection
        .transaction(async (transactionalEntityManager) => {
          if (!auction) {
            this.logger.warn(`auction not found with auctionId ${event.data.auctionId}`);
            return;
          }
          await this.markRewardTierNftAsWithdrawn(transactionalEntityManager, event, auction.id);

          event.processed = true;
          await transactionalEntityManager.save(event);
        })
        .catch((error) => {
          this.logger.error(error);
        });

      const auctionRewardTiers = await this.rewardTiersRepository.find({ auctionId: auction.id });

      const depositedNfts = await this.rewardTierNftsRepository.find({
        where: { deposited: true, rewardTierId: In(auctionRewardTiers.map((tier) => tier.id)) },
      });

      if (!depositedNfts.length) {
        auction.depositedNfts = false;
        await this.auctionsRepository.save(auction);
        this.auctionGateway.notifyAuctionWithdrawnNfts(auction.id, true);
      } else {
        this.auctionGateway.notifyAuctionWithdrawnNfts(auction.id, false);
      }
    }
  }

  private async markRewardTierNftAsDeposited(
    transactionalEntityManager: EntityManager,
    event: Erc721DepositedEvent,
    auctionId: number,
  ) {
    const collection = await transactionalEntityManager.findOne(NftCollection, {
      where: { address: event.data?.tokenAddress?.toLowerCase() },
    });

    if (!collection) throw new MarkRewardTierNftAsDepositedException('Collection not found');

    const nft = await transactionalEntityManager.findOne(Nft, {
      where: { collectionId: collection.id, tokenId: event.data?.tokenId },
    });
    if (!nft) throw new MarkRewardTierNftAsDepositedException('Nft not found');

    const rewardTiers = await transactionalEntityManager.find(RewardTier, {
      where: { auctionId: auctionId },
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

  private async markRewardTierNftAsWithdrawn(
    transactionalEntityManager: EntityManager,
    event: Erc721DepositedEvent,
    auctionId: number,
  ) {
    const collection = await transactionalEntityManager.findOne(NftCollection, {
      where: { address: event.data?.tokenAddress?.toLowerCase() },
    });

    if (!collection) throw new MarkRewardTierNftAsWithdrawnException('Collection not found');

    const nft = await transactionalEntityManager.findOne(Nft, {
      where: { collectionId: collection.id, tokenId: event.data?.tokenId },
    });
    if (!nft) throw new MarkRewardTierNftAsWithdrawnException('Nft not found');

    const rewardTiers = await transactionalEntityManager.find(RewardTier, {
      where: { auctionId: auctionId },
    });
    if (rewardTiers.length === 0) throw new MarkRewardTierNftAsWithdrawnException('Reward Tiers not found');

    await transactionalEntityManager.update(
      RewardTierNft,
      {
        rewardTierId: In(rewardTiers.map((rewardTier) => rewardTier.id)),
        nftId: nft.id,
        slot: event.data?.slotIndex,
      },
      { deposited: false },
    );
  }

  private async syncBidSubmittedEvents() {
    const events = await this.bidSubmittedEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} BidSubmitted events`);
    for (const event of events) {
      await this.connection
        .transaction(async (transactionalEntityManager) => {
          const auction = await transactionalEntityManager.findOne(Auction, {
            where: { onChainId: event.data?.auctionId },
          });

          if (!auction) {
            this.logger.warn(`auction not found with onChainId: ${event.data?.auctionId}`);
            return;
          }

          const user = await transactionalEntityManager.findOne(User, { address: event.data?.sender });
          if (!user) {
            this.logger.warn(`user not found with address: ${event.data?.sender}`);
            return;
          }

          const existingBid = await transactionalEntityManager.findOne(AuctionBid, {
            where: { auctionId: auction.id, userId: user.id },
          });
          let bid = null;
          const parsedAmount = utils.formatUnits(event.data.totalBid.toString(), auction.tokenDecimals);
          if (!existingBid) {
            bid = {
              auctionId: auction.id,
              userId: user.id,
              amount: +parsedAmount,
            };
            await transactionalEntityManager.save(AuctionBid, bid);
          } else {
            existingBid.amount = +parsedAmount;
            await transactionalEntityManager.save(AuctionBid, existingBid);
          }

          event.processed = true;
          await transactionalEntityManager.save(event);

          this.auctionGateway.notifyAuctionBidSubmitted(auction.id, {
            amount: +(bid || existingBid).amount,
            user: classToPlain(user),
          });
        })
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  // TODO: Implement logic
  private async syncBidWithdrawnEvents() {
    const events = await this.bidWithdrawnEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} BidWithdrawn events`);
    for (const event of events) {
      await this.connection
        .transaction(async (transactionalEntityManager) => {})
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  // TODO: Implement logic
  private async syncAuctionExtendedEvents() {
    const events = await this.auctionExtendedEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} AuctionExtended events`);
    for (const event of events) {
      await this.connection
        .transaction(async (transactionalEntityManager) => {})
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  // TODO: Implement logic
  private async syncBidMatchedEvents() {
    const events = await this.matchedBidEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} BidMatched events`);
    for (const event of events) {
      await this.connection
        .transaction(async (transactionalEntityManager) => {})
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  // TODO: Implement logic
  private async syncRevenueWithdrawnEvents() {
    const events = await this.withdrawnRevenueEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} RevenueWithdrawn events`);
    for (const event of events) {
      await this.connection
        .transaction(async (transactionalEntityManager) => {})
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  // TODO: Implement logic
  private async syncRevenueCapturedEvents() {
    const events = await this.capturedRevenueEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} RevenueCaptured events`);
    for (const event of events) {
      await this.connection
        .transaction(async (transactionalEntityManager) => {})
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  // TODO: Implement logic
  private async syncErc721ClaimedEvents() {
    const events = await this.withdrawnRevenueEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} RevenueWithdrawn events`);
    for (const event of events) {
      await this.connection
        .transaction(async (transactionalEntityManager) => {})
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }
}
