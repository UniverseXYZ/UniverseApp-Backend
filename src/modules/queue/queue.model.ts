import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { AppConfigModule } from '../configuration/configuration.module';

@Module({
  providers: [QueueService],
  exports: [QueueService],
  imports: [AppConfigModule]
})
export class QueueModel {}