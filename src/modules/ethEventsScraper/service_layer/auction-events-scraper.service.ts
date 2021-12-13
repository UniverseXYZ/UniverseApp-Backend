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
    @InjectRepository(AuctionBid)
    private auctionBidRepository: Repository<AuctionBid>,

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

      if (auction && auction.id) {
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

          const bid =
            (await transactionalEntityManager.findOne(AuctionBid, {
              where: { auctionId: auction.id, bidder: event.data.sender },
            })) ||
            (await transactionalEntityManager.create(AuctionBid, {
              auctionId: auction.id,
              bidder: event.data.sender,
            }));

          const parsedAmount = utils.formatUnits(event.data.totalBid.toString(), auction.tokenDecimals);
          bid.amount = +parsedAmount;
          await transactionalEntityManager.save(AuctionBid, bid);

          event.processed = true;
          await transactionalEntityManager.save(event);

          this.auctionGateway.notifyAuctionBidSubmitted(auction.id, {
            amount: bid.amount,
            user: bid.bidder,
          });
        })
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  private async syncBidWithdrawnEvents() {
    const events = await this.bidWithdrawnEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} BidWithdrawn events`);
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

          const bid = await transactionalEntityManager.findOne(AuctionBid, {
            where: { auctionId: auction.id, bidder: event.data.recipient },
          });

          if (!bid) {
            this.logger.warn(`No bid has been made to this auction from this user: ${event.data?.recipient}`);
            return;
          }

          await transactionalEntityManager.remove(AuctionBid, bid);

          event.processed = true;
          await transactionalEntityManager.save(event);

          this.auctionGateway.notifyAuctionBidWithdrawn(auction.id, {
            amount: bid.amount,
            user: bid.bidder,
          });
        })
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  private async syncAuctionExtendedEvents() {
    const events = await this.auctionExtendedEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} AuctionExtended events`);
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
          auction.endDate = new Date(event.data?.endTime * 1000);
          await transactionalEntityManager.save(Auction, auction);
          event.processed = true;
          await transactionalEntityManager.save(event);

          this.auctionGateway.notifyAuctionExtended(auction.id, auction.endDate);
        })
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  private async syncBidMatchedEvents() {
    const events = await this.matchedBidEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} BidMatched events`);
    for (const event of events) {
      let auctionId = 0;
      let finalised = false;
      await this.connection
        .transaction(async (transactionalEntityManager) => {
          const auction = await transactionalEntityManager.findOne(Auction, {
            where: { onChainId: event.data?.auctionId },
          });

          if (!auction) {
            this.logger.warn(`auction not found with onChainId: ${event.data?.auctionId}`);
            return;
          }

          const bids = await transactionalEntityManager.find(AuctionBid, {
            where: { auctionId: auction.id },
            order: { amount: 'DESC', id: 'ASC' },
          });
          const parsedAmount = utils.formatUnits(event.data.winningBidAmount.toString(), auction.tokenDecimals);

          if (event.data.slotIndex > bids.length) {
            this.logger.warn(`didn't find matching bid to slotIndex ${event.data.slotIndex}`);
            await transactionalEntityManager.create(AuctionBid, {
              amount: +parsedAmount,
              bidder: event.data.winner,
              auctionId: auction.id,
              onChainSlotIndex: event.data.slotIndex,
            });
          } else {
            // Slot indexes are 1 based
            const bid = bids[event.data.slotIndex - 1];
            await transactionalEntityManager.update(AuctionBid, bid.id, {
              amount: +parsedAmount,
              bidder: event.data.winner,
              auctionId: auction.id,
              onChainSlotIndex: event.data.slotIndex,
            });
          }

          await transactionalEntityManager.save(event);

          // Set finalised only if this is the last slot of the auction
          let biggestSlotIdx = 0;
          const rewardTiers = await transactionalEntityManager.find(RewardTier, { where: { auctionId: auction.id } });
          rewardTiers.forEach((tier) => {
            const slots = tier.slots;
            slots.forEach((slot) => {
              if (slot.index > biggestSlotIdx) {
                biggestSlotIdx = slot.index;
              }
            });
          });

          if (event.data.slotIndex === biggestSlotIdx) {
            finalised = true;
            auction.finalised = true;
            await transactionalEntityManager.save(auction);
          }

          event.processed = true;
          await transactionalEntityManager.save(event);
          auctionId = auction.id;
        })
        .catch((error) => {
          this.logger.error(error);
        });

      if (auctionId) {
        const bids = await this.auctionBidRepository
          .createQueryBuilder('bid')
          .leftJoinAndMapOne('bid.user', User, 'bidder', 'bidder.address = bid.bidder')
          .where({ auctionId })
          .orderBy('bid.amount', 'DESC')
          .addOrderBy('bid.id', 'ASC')
          .getMany();

        this.auctionGateway.notifyBidMatched(auctionId, { bids, finalised });
      }
    }
  }

  private async syncRevenueWithdrawnEvents() {
    const events = await this.withdrawnRevenueEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} RevenueWithdrawn events`);
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

          const revenueClaimed = utils.formatUnits(event.data.amount, auction.tokenDecimals);
          auction.revenueClaimed += +revenueClaimed;
          await transactionalEntityManager.save(auction);

          event.processed = true;
          await transactionalEntityManager.save(event);

          this.auctionGateway.notifyAuctionRevenueWithdraw(auction.id, auction.revenueClaimed);
        })
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  private async syncRevenueCapturedEvents() {
    const events = await this.capturedRevenueEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} RevenueCaptured events`);
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

          const rewardTiers = await transactionalEntityManager.find(RewardTier, {
            where: { auctionId: auction.id },
          });

          if (!rewardTiers.length) {
            this.logger.warn(`Reward tiers not found for auction id: ${auction.id}`);
            return;
          }
          let slotCaptured = false;
          for (const tier of rewardTiers) {
            for (const slot of tier.slots) {
              if (slot.index === event.data?.slotIndex) {
                slotCaptured = true;
                slot.capturedRevenue = true;
                await transactionalEntityManager.save(RewardTier, tier);

                event.processed = true;
                await transactionalEntityManager.save(event);
                this.auctionGateway.notifyAuctionSlotCaptured(auction.id, { tierId: tier.id, slotIndex: slot.index });
                break;
              }
            }
            if (slotCaptured) {
              break;
            }
          }
        })
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  private async syncErc721ClaimedEvents() {
    const events = await this.erc721ClaimedEventRepository.find({ where: { processed: false } });
    this.logger.log(`found ${events.length} ERC721Claimed events`);
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
          await this.markSlotNftsAsClaimed(transactionalEntityManager, event, auction.id);

          event.processed = true;
          await transactionalEntityManager.save(event);

          this.auctionGateway.notifyERC721Claimed(auction.id, {
            claimer: event.data.claimer,
            slotIndex: event.data.slotIndex,
          });
        })
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }

  private async markSlotNftsAsClaimed(
    transactionalEntityManager: EntityManager,
    event: Erc721ClaimedEvent,
    auctionId: number,
  ) {
    const rewardTiers = await transactionalEntityManager.find(RewardTier, {
      where: { auctionId: auctionId },
    });
    if (rewardTiers.length === 0) throw new MarkRewardTierNftAsWithdrawnException('Reward Tiers not found');

    await transactionalEntityManager.update(
      RewardTierNft,
      {
        rewardTierId: In(rewardTiers.map((rewardTier) => rewardTier.id)),
        slot: event.data?.slotIndex,
      },
      { claimed: true },
    );
  }
}
