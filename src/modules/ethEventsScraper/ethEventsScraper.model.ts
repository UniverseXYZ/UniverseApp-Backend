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
    ]),
  ],
  providers: [EthEventsScraperService, AuctionEventsScraperService],
  exports: [EthEventsScraperService],
})
export class EthEventsScraperModule {}
