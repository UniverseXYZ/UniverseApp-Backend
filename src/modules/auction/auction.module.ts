import { Module } from '@nestjs/common';
import { AuctionController } from './entrypoints/auction.controller';
import { AuctionService } from './service-layer/auction.service';

@Module({
  controllers: [AuctionController],
  providers: [AuctionService],
})
export class AuctionModule {}
