import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateRewardTierBody } from './dto';
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
}
