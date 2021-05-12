import { Module } from '@nestjs/common';
import { AppConfigModule } from '../configuration/configuration.module';
import { QueueModule } from '../queue/queue.model';
import { NftScraperService } from './nftScraper.service';

@Module({
    imports: [AppConfigModule, QueueModule],
    providers: [NftScraperService],
    exports: [NftScraperService],
})
export class NftScraperModule { }
