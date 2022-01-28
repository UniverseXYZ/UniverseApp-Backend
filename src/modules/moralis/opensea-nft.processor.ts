import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { OpenseaNftService } from './opensea-nft.service';

import { OPENSEA_NFT_QUEUE, PROCCESS_OPENSEA_NFT } from './constants';

@Processor(OPENSEA_NFT_QUEUE)
export class OpenseaNftProcessor {
  constructor(private openseaNftService: OpenseaNftService) {}
  private readonly logger = new Logger(OpenseaNftProcessor.name);

  @Process({ name: PROCCESS_OPENSEA_NFT })
  async handleProcessToken(job: Job) {
    await this.openseaNftService.newOpenSeaNftOwnerHander(job.data);
  }
}
