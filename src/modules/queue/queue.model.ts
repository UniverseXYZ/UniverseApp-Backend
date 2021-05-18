import { Module } from '@nestjs/common';
import { AppConfigModule } from '../configuration/configuration.module';
import { QueueService } from './queue.service';

@Module({
    imports: [AppConfigModule],
    providers: [QueueService],
    exports: [QueueService],
})
export class QueueModule { }
