import { Body, Controller, Param, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateAuctionBody, CreateRewardTierBody, UpdateRewardTierBody, UpdateRewardTierExtraBody } from './dto';
import { AuctionService } from '../service-layer/auction.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

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
      createRewardTierBody.auctionId,
      createRewardTierBody.name,
      createRewardTierBody.numberOfWinners,
      createRewardTierBody.nftsPerWinner,
      createRewardTierBody.nftIds,
    );
  }

  @Put('reward-tiers')
  @UseGuards(JwtAuthGuard)
  async updateRewardTier(
    @Req() req,
    @Body() updateRewardTierBody: UpdateRewardTierBody,
  ) {
    return await this.auctionService.updateRewardTier(
      req.user.sub,
      updateRewardTierBody.tierId,
      updateRewardTierBody.name,
      updateRewardTierBody.numberOfWinners,
      updateRewardTierBody.nftsPerWinner,
      updateRewardTierBody.nftIds,
    );
  }

  @Put('reward-tiers-extra')
  @UseGuards(JwtAuthGuard)
  async updateRewardTierExtra(
    @Req() req,
    @Body() updateRewardTierExtraBody: UpdateRewardTierExtraBody,
  ) {
    return await this.auctionService.updateRewardTierExtraData(
      req.user.sub,
      updateRewardTierExtraBody.tierId,
      updateRewardTierExtraBody.customDescription,
      updateRewardTierExtraBody.tierColor
    );
  }

  @Post('/reward-tiers-image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Param() tierId: number,
  ) {
    const ret = await this.auctionService.updateRewardTierImage(req.user, tierId, file );
    return ret;
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
