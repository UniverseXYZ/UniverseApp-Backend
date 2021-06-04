import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../configuration/configuration.module';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { MulterConfigService } from '../multer/multer.service';
import { User } from '../users/user.entity';
import { Auction } from './domain/auction.entity';
import { RewardTierNft } from './domain/reward-tier-nft.entity';
import { RewardTier } from './domain/reward-tier.entity';
import { AuctionController } from './entrypoints/auction.controller';
import { AuctionService } from './service-layer/auction.service';

@Module({
  imports: [AppConfigModule, FileStorageModule, MulterModule.registerAsync({
    useClass: MulterConfigService,
  }), TypeOrmModule.forFeature([User, Auction, RewardTier, RewardTierNft])],
  controllers: [AuctionController],
  providers: [AuctionService],
})
export class AuctionModule {}
