import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AppConfigModule } from '../configuration/configuration.module';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { FileSystemModule } from '../file-system/file-system.module';
import { NftCollection } from '../nft/domain/collection.entity';
import { MoralisLog } from './domain/moralis-log.entity';
import { MonitoredNfts } from '../nft/domain/monitored-nfts';
import { Nft } from '../nft/domain/nft.entity';
import { User } from '../users/user.entity';
import { MoralisService } from './moralis.service';
import { MoralisWebHookController } from './moralis.webhook.controller';
import { MoralisController } from './moralis.controller';
import { NftValidator } from './service/nft-validator';
import { MORALIS_NEW_NFT_QUEUE } from './constants';
import { MoralisProcessor } from './moralis.processor';

@Module({
  imports: [
    AppConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([Nft, NftCollection, User, MonitoredNfts, MoralisLog]),
    FileStorageModule,
    FileSystemModule,
    BullModule.registerQueue({
      name: MORALIS_NEW_NFT_QUEUE,
    }),
  ],
  providers: [MoralisService, NftValidator, MoralisProcessor],
  exports: [MoralisService],
  controllers: [MoralisWebHookController, MoralisController],
})
export class MoralisModule {}
