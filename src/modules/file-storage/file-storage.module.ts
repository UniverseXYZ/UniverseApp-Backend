import { Module } from '@nestjs/common';
import { AppConfigModule } from '../configuration/configuration.module';
import { S3Service } from './s3.service';
import { ArweaveService } from './arweave.service';
import { FleekService } from './fleek.service';

@Module({
  imports: [AppConfigModule],
  providers: [S3Service, ArweaveService, FleekService],
  exports: [S3Service, ArweaveService, FleekService],
})
export class FileStorageModule {}
