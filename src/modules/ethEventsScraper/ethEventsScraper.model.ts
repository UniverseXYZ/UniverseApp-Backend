import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../configuration/configuration.module';
import { NftCollection } from '../nft/domain/collection.entity';
import { Nft } from '../nft/domain/nft.entity';
import { NftFile } from '../nft/domain/nft-file.entity';
import { NftTransaction } from '../nft/domain/nft-transaction.entity';
import { QueueModel } from '../queue/queue.model';
import { User } from '../users/user.entity';
import { EthEventsScraperService } from './service_layer/ethEventsScraper.service';
import { MintedNftEvent } from './domain/mintNftEvent';
import { DeployCollectionEvent } from './domain/deploy-collection-event';
// import { MintingCollection } from '../nft/domain/minting-collection.entity';
// import { MintingNft } from '../nft/domain/minting-nft.entity';
@Module({
  imports: [
    AppConfigModule,
    QueueModel,
    HttpModule,
    TypeOrmModule.forFeature([
      NftFile,
      NftTransaction,
      Nft,
      NftCollection,
      User,
      MintedNftEvent,
      DeployCollectionEvent,
      // MintingCollection,
      // MintingNft,
    ]),
  ],
  providers: [EthEventsScraperService],
  exports: [EthEventsScraperService],
})
export class EthEventsScraperModule {}
