import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { MintingNft } from '../domain/minting-nft.entity';

@Injectable()
export class NftCronService {
  private logger = new Logger(NftCronService.name);
  private TIME_LIMT = 12;

  constructor(
    @InjectRepository(MintingNft)
    private mintingNftRepository: Repository<MintingNft>,
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS)
  async deleteMintingNfts() {
    this.logger.log('start');
    const date = new Date();
    date.setHours(date.getHours() - this.TIME_LIMT);
    const result = await this.mintingNftRepository.delete({
      txHashes: null,
      createdAt: LessThanOrEqual(date),
    });
    this.logger.log(`deleted ${result.affected} records`);
    this.logger.log('end');
  }
}
