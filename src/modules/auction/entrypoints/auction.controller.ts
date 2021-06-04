import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateAuctionBody, CreateRewardTierBody } from './dto';
import { AuctionService } from '../service-layer/auction.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api')
export class AuctionController {
  constructor(private auctionService: AuctionService) {}

  @Post('reward-tiers')
  @UseGuards(JwtAuthGuard)
  async createRewardTier(
    @Req() req,
    @Body() createRewardTierBody: CreateRewardTierBody,
  ) {
    return await this.auctionService.createRewardTier(
      req.user.sub,
      createRewardTierBody.name,
      createRewardTierBody.numberOfWinners,
      createRewardTierBody.nftsPerWinner,
      createRewardTierBody.nftIds,
    );
  }

  @Post('create-auction')
  @UseGuards(JwtAuthGuard)
  async createAuction(
    @Req() req,
    @Body() createAuctionBody: CreateAuctionBody,
  ) {
    return await this.auctionService.createAuction(
      req.user.sub,
      createAuctionBody.name,
      createAuctionBody.startDate,
      createAuctionBody.endDate,
      createAuctionBody.bidCurrency,
      createAuctionBody.startingBid);
  }
}
