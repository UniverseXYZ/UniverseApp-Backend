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
import { OpenseaNftService } from './opensea-nft.service';
import { MoralisWebHookController } from './moralis.webhook.controller';
import { MoralisController } from './moralis.controller';
import { NftValidator } from './service/nft-validator';
import { MORALIS_NEW_NFT_QUEUE, OPENSEA_NFT_QUEUE } from './constants';
import { MoralisProcessor } from './moralis.processor';
import { OpenseaNftProcessor } from './opensea-nft.processor';

@Module({
  imports: [
    AppConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([Nft, NftCollection, User, MonitoredNfts, MoralisLog]),
    FileStorageModule,
    FileSystemModule,
    BullModule.registerQueue(
      {
        name: MORALIS_NEW_NFT_QUEUE,
      },
      {
        name: OPENSEA_NFT_QUEUE,
      },
    ),
  ],
  providers: [MoralisService, OpenseaNftService, NftValidator, MoralisProcessor, OpenseaNftProcessor],
  exports: [MoralisService, OpenseaNftService],
  controllers: [MoralisWebHookController, MoralisController],
})
export class MoralisModule {}
