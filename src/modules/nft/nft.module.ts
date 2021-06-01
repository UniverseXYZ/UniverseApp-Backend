import { Module } from '@nestjs/common';
import { NftService } from './service_layer/nft.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nft } from './domain/nft.entity';
import { NftController } from './entrypoints/nft.controller';
import { NftCollection } from './domain/collection.entity';
import { FileProcessingModule } from '../file-processing/file-processing.module';
import { S3Module } from '../s3/s3.module';
import { AppConfigModule } from '../configuration/configuration.module';
import { FileSystemModule } from '../file-system/file-system.module';

@Module({
  providers: [NftService],
  imports: [
    TypeOrmModule.forFeature([Nft, NftCollection]),
    FileProcessingModule,
    S3Module,
    AppConfigModule,
    FileSystemModule,
  ],
  exports: [],
  controllers: [NftController],
})
export class NftModule {}
