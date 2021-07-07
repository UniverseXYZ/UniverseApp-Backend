import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../configuration/configuration.module';
import { NftCollection } from '../nft/domain/collection.entity';
import { Nft } from '../nft/domain/nft.entity';
import { QueueModel } from '../queue/queue.model';
import { User } from '../users/user.entity';
import { EthEventsScraperService } from './service_layer/ethEventsScraper.service';
import { MintedNftEvent } from './domain/mintNftEvent.entity';
import { DeployCollectionEvent } from './domain/deploy-collection-event.entity';
import { SavedNft } from '../nft/domain/saved-nft.entity';
import { MintingCollection } from '../nft/domain/minting-collection.entity';

@Module({
  imports: [
    AppConfigModule,
    QueueModel,
    HttpModule,
    TypeOrmModule.forFeature([Nft, NftCollection, User, MintedNftEvent, DeployCollectionEvent, SavedNft, MintingCollection]),
  ],
  providers: [EthEventsScraperService],
  exports: [EthEventsScraperService],
})
export class EthEventsScraperModule {}
