import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../configuration/configuration.module';
import { NftCollection } from '../nft/domain/collection.entity';
import { Nft } from '../nft/domain/nft.entity';
import { QueueModel } from '../queue/queue.model';
import { User } from '../users/user.entity';
import { NftScraperService } from './nftScraper.service';

@Module({
  imports: [AppConfigModule, QueueModel, HttpModule, TypeOrmModule.forFeature([Nft, NftCollection, User])],
  providers: [NftScraperService],
  exports: [NftScraperService],
})
export class NftScraperModule {}
