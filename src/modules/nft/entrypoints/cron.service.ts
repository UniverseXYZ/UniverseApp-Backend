import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { AppConfig } from '../../configuration/configuration.service';
import { NftStatusEnum } from 'src/common/constants/enums';
import { In, LessThanOrEqual, Repository } from 'typeorm';
// import { MintingNft } from '../domain/minting-nft.entity';
import { Nft } from '../domain/nft.entity';

@Injectable()
export class NftCronService {
  private logger = new Logger(NftCronService.name);
  private TIME_LIMT = 12;

  constructor(
    @InjectRepository(Nft)
    private nftRepository: Repository<Nft>,
    private config: AppConfig,
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS)
  async deleteMintingNfts() {
    this.logger.log('start');
    const date = new Date();
    date.setHours(date.getHours() - this.TIME_LIMT);
    // const result = await this.nftRepository.delete({
    //   status: NftStatusEnum.MINTING,
    //   // txHashes: null,
    //   transactions: [],
    //   createdAt: LessThanOrEqual(date),
    // });

    const mintingNftsWithNoTxHashes = await this.nftRepository.query(`
      SELECT "nft"."id", 
        "nft_transaction"."id" transactionId, 
        "nft_transaction"."hash",
        "nft"."createdAt"
      FROM "${this.config.values.database.database}"."nft"
      LEFT JOIN "${this.config.values.database.database}"."nft_transaction" ON "nft_transaction"."nftId" = "nft"."id"
      WHERE "nft"."createdAt" <= $1 AND 
        "nft"."status" = '${NftStatusEnum.MINTING}' AND
        ("nft_transaction"."id" IS NULL OR "nft_transaction"."hash" IS NULL)
    `, [
      date,
    ]);

    const nftIdsToDelete = mintingNftsWithNoTxHashes.map(mintingNft => mintingNft.id);
 
    const result = await this.nftRepository.delete({
      id: In(nftIdsToDelete),
    }); 
    
    this.logger.log(`deleted ${result.affected} records`);
    this.logger.log('end');
  }
}
