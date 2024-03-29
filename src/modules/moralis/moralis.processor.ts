import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MoralisService } from './moralis.service';

import { MORALIS_NEW_NFT_QUEUE, PROCESS_MORALIS_TOKEN_JOB } from './constants';

@Processor(MORALIS_NEW_NFT_QUEUE)
export class MoralisProcessor {
  constructor(private moralisService: MoralisService) {}
  private readonly logger = new Logger(MoralisProcessor.name);

  @Process({ name: PROCESS_MORALIS_TOKEN_JOB, concurrency: 20 })
  async handleProcessToken(job: Job) {
    await this.moralisService.moralisNewNFTOwnerHandler(job.data);
  }
}
