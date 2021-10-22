import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../configuration/configuration.module';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { FileSystemModule } from '../file-system/file-system.module';
import { NftCollection } from '../nft/domain/collection.entity';
import { MonitoredNfts } from '../nft/domain/monitored-nfts';
import { Nft } from '../nft/domain/nft.entity';
import { QueueModel } from '../queue/queue.model';
import { User } from '../users/user.entity';
import { MoralisService } from './moralis.service';
import { MoralisWebHookController } from './moralis.webhook.controller';

@Module({
  imports: [
    AppConfigModule,
    QueueModel,
    HttpModule,
    TypeOrmModule.forFeature([Nft, NftCollection, User, MonitoredNfts]),
    FileStorageModule,
    FileSystemModule,
  ],
  providers: [MoralisService],
  exports: [MoralisService],
  controllers: [MoralisWebHookController],
})
export class MoralisModule {}
