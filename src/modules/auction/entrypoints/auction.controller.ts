import { Body, Controller, Get, Param, Patch, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuctionBody, CreateAuctionBody, CreateRewardTierBody, UpdateAuctionBody, UpdateAuctionExtraBody, UpdateAuctionExtraBodyParams, UpdateRewardTierBody, UpdateRewardTierExtraBody } from './dto';
import { AuctionService } from '../service-layer/auction.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api')
export class AuctionController {
  constructor(private auctionService: AuctionService) { }

  //needs to check that there are enough nfts, and that the nfts are not already set as rewards in other tiers
  @Post('reward-tiers')
  @UseGuards(JwtAuthGuard)
  async createRewardTier(
    @Req() req,
    @Body() createRewardTierBody: CreateRewardTierBody,
  ) {
    return await this.auctionService.createRewardTier(
      req.user.sub,
      createRewardTierBody.auctionId,
      {
        name: createRewardTierBody.name,
        numberOfWinners: createRewardTierBody.numberOfWinners,
        nftsPerWinner: createRewardTierBody.nftsPerWinner,
        nftIds: createRewardTierBody.nftIds,
        minimumBid: createRewardTierBody.minimumBid,
        tierPosition: createRewardTierBody.tierPosition
      }
    );
  }

  //check that no nft is deposited yet
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
  ) {
    const ret = await this.auctionService.updateRewardTierImage(req.user, req.body.tierId, file);
    return ret;
  }

  @Post('/auction')
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

  @Patch('auction')
  @UseGuards(JwtAuthGuard)
  async updateAuction(
    @Req() req,
    @Body() updateAuctionBody: UpdateAuctionBody,
  ) {
    return await this.auctionService.updateAuction(
      req.user.sub,
      updateAuctionBody.auctionId,
      {
        name: updateAuctionBody.name,
        startDate: updateAuctionBody.startDate,
        endDate: updateAuctionBody.endDate,
        bidCurrency: updateAuctionBody.bidCurrency,
        startingBid: updateAuctionBody.startingBid
      });
  }

  @Patch('auction-extra-data')
  @UseGuards(JwtAuthGuard)
  async updateAuctionExtraData(
    @Req() req,
    @Body() updateAuctionExtraBody: UpdateAuctionExtraBody,
  ) {
    return await this.auctionService.updateAuctionExtraData(
      req.user.sub,
      updateAuctionExtraBody.auctionId,
      {
        headline: updateAuctionExtraBody.headline,
        link: updateAuctionExtraBody.link,
        backgroundBlur: updateAuctionExtraBody.backgroundBlur,
      });
  }

  @Post('/auction-promo-image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadAuctionPromoImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const ret = await this.auctionService.updateAuctionPromoImage(req.user, req.body.auctionId, file);
    return ret;
  }

  @Post('/auction-background-image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadAuctionBackgroundImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    console.log(req);
    const ret = await this.auctionService.updateAuctionBackgroundImage(req.user, req.body.auctionId, file);
    return ret;
  }

  @Get('auctions')
  @UseGuards(JwtAuthGuard)
  async listAuctions(
    @Req() req,
  ) {
    return await this.auctionService.listAuctions(
      req.user.sub,
    );
  }

  @Get('auctions/{:status}')
  @UseGuards(JwtAuthGuard)
  async listAuctionsFiltered(
    @Req() req,
  ) {
    return await this.auctionService.listAuctions(
      req.user.sub,
    );
  }
}
