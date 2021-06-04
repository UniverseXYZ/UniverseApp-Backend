import { Module } from '@nestjs/common';
import { NftService } from './service_layer/nft.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nft } from './domain/nft.entity';
import { NftController } from './entrypoints/nft.controller';
import { NftCollection } from './domain/collection.entity';
import { FileProcessingModule } from '../file-processing/file-processing.module';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { AppConfigModule } from '../configuration/configuration.module';
import { FileSystemModule } from '../file-system/file-system.module';
import { SavedNft } from './domain/saved-nft.entity';

@Module({
  providers: [NftService],
  imports: [
    TypeOrmModule.forFeature([Nft, NftCollection, SavedNft]),
    FileProcessingModule,
    FileStorageModule,
    AppConfigModule,
    FileSystemModule,
  ],
  exports: [],
  controllers: [NftController],
})
export class NftModule {}
