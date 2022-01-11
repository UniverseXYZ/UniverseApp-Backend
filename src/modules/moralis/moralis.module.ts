import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../configuration/configuration.module';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { FileSystemModule } from '../file-system/file-system.module';
import { NftCollection } from '../nft/domain/collection.entity';
import { MoralisLog } from './domain/moralis-log.entity';
import { MonitoredNfts } from '../nft/domain/monitored-nfts';
import { Nft } from '../nft/domain/nft.entity';
import { NftFile } from '../nft/domain/nft-file.entity';
import { QueueModel } from '../queue/queue.model';
import { User } from '../users/user.entity';
import { MoralisService } from './moralis.service';
import { MoralisWebHookController } from './moralis.webhook.controller';
import { MoralisController } from './moralis.controller';
import { NftValidator } from './service/nft-validator';

@Module({
  imports: [
    AppConfigModule,
    QueueModel,
    HttpModule,
    TypeOrmModule.forFeature([
      NftFile, 
      Nft, 
      NftCollection, 
      User, 
      MonitoredNfts, 
      MoralisLog
    ]),
    FileStorageModule,
    FileSystemModule,
  ],
  providers: [MoralisService, NftValidator],
  exports: [MoralisService],
  controllers: [MoralisWebHookController, MoralisController],
})
export class MoralisModule {}
