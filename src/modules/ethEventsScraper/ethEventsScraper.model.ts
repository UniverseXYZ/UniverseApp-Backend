import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../configuration/configuration.module';
import { NftCollection } from '../nft/domain/collection.entity';
import { Nft } from '../nft/domain/nft.entity';
import { QueueModule } from '../queue/queue.model';
import { User } from '../users/user.entity';
import { EthEventsScraperService } from './service_layer/ethEventsScraper.service';

@Module({
    imports: [AppConfigModule, QueueModule, HttpModule, TypeOrmModule.forFeature([Nft, NftCollection, User]),],
    providers: [EthEventsScraperService],
    exports: [EthEventsScraperService],
})
export class EthEventsScraperModule { }
