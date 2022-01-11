import { Module } from '@nestjs/common';
import { NftService } from './service_layer/nft.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nft } from './domain/nft.entity';
import { NftFile } from './domain/nft-file.entity';
import { NftTransaction } from './domain/nft-transaction.entity';
import { NftController } from './entrypoints/nft.controller';
import { NftCollection } from './domain/collection.entity';
import { FileProcessingModule } from '../file-processing/file-processing.module';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { AppConfigModule } from '../configuration/configuration.module';
import { FileSystemModule } from '../file-system/file-system.module';
// import { SavedNft } from './domain/saved-nft.entity';
// import { MintingCollection } from './domain/minting-collection.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { RewardTierNft } from '../auction/domain/reward-tier-nft.entity';
// import { MintingNft } from './domain/minting-nft.entity';
import { NftCronService } from './entrypoints/cron.service';

@Module({
  providers: [NftService, NftCronService],
  imports: [
    // TypeOrmModule.forFeature([Nft, NftCollection, SavedNft, MintingCollection, User, RewardTierNft, MintingNft]),
    TypeOrmModule.forFeature([NftFile, NftTransaction, Nft, NftCollection, User, RewardTierNft]),
    FileProcessingModule,
    FileStorageModule,
    AppConfigModule,
    FileSystemModule,
    UsersModule,
  ],
  exports: [],
  controllers: [NftController],
})
export class NftModule {}
