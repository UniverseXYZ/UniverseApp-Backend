import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../configuration/configuration.module';
import { NftCollection } from '../nft/domain/collection.entity';
import { Nft } from '../nft/domain/nft.entity';
import { QueueModel } from '../queue/queue.model';
import { User } from '../users/user.entity';
import { EthEventsScraperService } from './service_layer/ethEventsScraper.service';
import { MintedNftEvent } from './domain/mintNftEvent';
import { DeployCollectionEvent } from './domain/deploy-collection-event';
import { MintingCollection } from '../nft/domain/minting-collection.entity';
import { MintingNft } from '../nft/domain/minting-nft.entity';
import { AuctionEventsScraperService } from './service_layer/auction-events-scraper.service';
import { AuctionCreatedEvent } from './domain/create-auction-event';
import { Erc721DepositedEvent } from './domain/deposited-erc721-event';
import { AuctionCanceledEvent } from './domain/auction-canceled-event';
import { AuctionGateway } from '../auction/service-layer/auction.gateway';
import { Erc721WithdrawnEvent } from './domain/withdrawn-erc721-event';
import { Auction } from '../auction/domain/auction.entity';
import { RewardTier } from '../auction/domain/reward-tier.entity';
import { RewardTierNft } from '../auction/domain/reward-tier-nft.entity';
import { BidSubmittedEvent } from './domain/submitted-bid-event';
import { CapturedRevenueEvent } from './domain/captured-revenue-event';
import { Erc721ClaimedEvent } from './domain/claimed-erc721-event';
import { AuctionExtendedEvent } from './domain/extended-auction-event';
import { MatchedBidEvent } from './domain/matched-bids-event';
import { WithdrawnRevenueEvent } from './domain/withdrawn-revenue-event';
import { BidWithdrawnEvent } from './domain/withdrawn-bid-event';
import { AuctionBid } from '../auction/domain/auction.bid.entity';
@Module({
  imports: [
    AppConfigModule,
    QueueModel,
    HttpModule,
    TypeOrmModule.forFeature([
      Nft,
      NftCollection,
      User,
      MintedNftEvent,
      DeployCollectionEvent,
      MintingCollection,
      MintingNft,
      AuctionCreatedEvent,
      RewardTier,
      RewardTierNft,
      Auction,
      Erc721DepositedEvent,
      Erc721WithdrawnEvent,
      AuctionCanceledEvent,
      BidSubmittedEvent,
      CapturedRevenueEvent,
      Erc721ClaimedEvent,
      AuctionExtendedEvent,
      MatchedBidEvent,
      WithdrawnRevenueEvent,
      BidWithdrawnEvent,
      AuctionBid,
    ]),
  ],
  providers: [EthEventsScraperService, AuctionEventsScraperService, AuctionGateway],
  exports: [EthEventsScraperService],
})
export class EthEventsScraperModule {}
