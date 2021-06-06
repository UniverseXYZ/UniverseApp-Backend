import { Body, Controller, Param, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuctionBody, CreateAuctionBody, CreateRewardTierBody, UpdateAuctionBody, UpdateAuctionExtraBody, UpdateRewardTierBody, UpdateRewardTierExtraBody } from './dto';
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

  @Put('reward-tiers-extra-data')
  @UseGuards(JwtAuthGuard)
  async updateRewardTierExtraData(
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
  async uploadRewardsTierImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Param() tierId: number,
  ) {
    const ret = await this.auctionService.updateRewardTierImage(req.user, tierId, file );
    return ret;
  }

  @Post('auction')
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

  @Put('auction')
  @UseGuards(JwtAuthGuard)
  async updateAuction(
    @Req() req,
    @Body() updateAuctionBody: UpdateAuctionBody,
  ) {
    return await this.auctionService.updateAuction(
      req.user.sub,
      updateAuctionBody.auctionId,
      updateAuctionBody.name,
      updateAuctionBody.startDate,
      updateAuctionBody.endDate,
      updateAuctionBody.bidCurrency,
      updateAuctionBody.startingBid);
  }

  @Put('auction-extra-data')
  @UseGuards(JwtAuthGuard)
  async updateAuctionExtraData(
    @Req() req,
    @Body() updateAuctionExtraBody: UpdateAuctionExtraBody,
  ) {
    return await this.auctionService.updateAuctionExtraData(
      req.user.sub,
      updateAuctionExtraBody.auctionId,
      updateAuctionExtraBody.headline,
      updateAuctionExtraBody.link,
      updateAuctionExtraBody.backgroundBlur);
  }

  @Post('/auction-promo-image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadAuctionPromoImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Param() auctionId: number,
  ) {
    const ret = await this.auctionService.updateAuctionPromoImage(req.user, auctionId, file );
    return ret;
  }

  @Post('/auction-background-image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadAuctionBackgroundImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Param() auctionId: number,
  ) {
    const ret = await this.auctionService.updateAuctionBackgroundImage(req.user, auctionId, file );
    return ret;
  }
}
