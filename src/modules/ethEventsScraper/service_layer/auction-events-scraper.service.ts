import { Connection, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';

import { AuctionCreatedEvent } from '../domain/create-auction-event';
import { Auction } from '../../auction/domain/auction.entity';
import { Erc721DepositedEvent } from '../domain/deposited-erc721-event';

@Injectable()
export class AuctionEventsScraperService {
  private logger = new Logger(AuctionEventsScraperService.name);
  processing = false;

  constructor(
    @InjectRepository(AuctionCreatedEvent)
    private auctionCreatedEventRepository: Repository<AuctionCreatedEvent>,
    @InjectRepository(Erc721DepositedEvent)
    private erc721DepositedEventRepository: Repository<Erc721DepositedEvent>,
    private connection: Connection,
  ) {}

  @Cron('*/9 * * * * *')
  public async syncAuctionEvents() {
    this.logger.log('start');
    try {
      if (this.processing) return;
      this.processing = true;
      await this.syncAuctionCreatedEvents();
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

          event.processed = true;
          await transactionalEntityManager.save(event);
        })
        .catch((error) => {
          this.logger.error(error);
        });
    }
  }
}
