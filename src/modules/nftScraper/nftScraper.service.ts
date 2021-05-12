import { Injectable, Logger } from '@nestjs/common';
import { AppConfig } from '../configuration/configuration.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class NftScraperService {
    constructor(
        private readonly config: AppConfig,
        private readonly queue: QueueService,

    ) {

    }

    async onModuleInit() {
        this.queue.initQueue('nftScraper', this.getNftTokens, 3);
        console.log(`The module has been initialized.`);
    }

    async getNftTokens(input: any, cb: any){
        console.log(input);
        cb(null, true);
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async getNftsForUsers() {
        this.queue.pushToQueue('nftScraper', {'asda': 'asdadaa'});
    }
}