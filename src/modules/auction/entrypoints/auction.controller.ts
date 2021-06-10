import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuctionBody, CreateAuctionBody, CreateRewardTierBody, UpdateAuctionBody, UpdateAuctionExtraBody, UpdateAuctionExtraBodyParams, UpdateRewardTierBody, UpdateRewardTierExtraBody } from './dto';
import { AuctionService } from '../service-layer/auction.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api')
export class AuctionController {
  constructor(private auctionService: AuctionService) { }

  //Todo: add endpoint to get reward tier ?
  //Todo: needs to check that there are enough nfts, and that the nfts are not already set as rewards in other tiers
  @Post('reward-tier')
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

  //Todo: check that no nft is deposited yet?
  @Patch('reward-tier')
  @UseGuards(JwtAuthGuard)
  async updateRewardTier(
    @Req() req,
    @Body() updateRewardTierBody: UpdateRewardTierBody,
  ) {
    return await this.auctionService.updateRewardTier(
      req.user.sub,
      updateRewardTierBody.tierId,
      {
        name: updateRewardTierBody.name,
        numberOfWinners: updateRewardTierBody.numberOfWinners,
        nftsPerWinner: updateRewardTierBody.nftsPerWinner,
        nftIds: updateRewardTierBody.nftIds,
      }
    );
  }

  @Patch('reward-tier-extra-data')
  @UseGuards(JwtAuthGuard)
  async updateRewardTierExtraData(
    @Req() req,
    @Body() updateRewardTierExtraBody: UpdateRewardTierExtraBody,
  ) {
    return await this.auctionService.updateRewardTierExtraData(
      req.user.sub,
      updateRewardTierExtraBody.tierId,
      {
        customDescription: updateRewardTierExtraBody.customDescription,
        tierColor: updateRewardTierExtraBody.tierColor
      }
    );
  }

  @Post('/reward-tier-image')
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
        startingBid: updateAuctionBody.startingBid,
        txHash: updateAuctionBody.txHash
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

  @Get('auctions/byUser')
  @UseGuards(JwtAuthGuard)
  async listAuctionsByUser(
    @Req() req,
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 0
  ) {
    return await this.auctionService.listAuctionsByUser(
      req.user.sub,
      page,
      limit
    );
  }

  @Get('auctions/byUser/{:status}')
  @UseGuards(JwtAuthGuard)
  async listAuctionsByUserFiltered(
    @Req() req,
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 0,
    @Param('status') status: string = ''
  ) {
    if (status !== '') return;

    return await this.auctionService.listAuctionsByUserAndStatus(
      req.user.sub,
      status,
      page,
      limit
    );
  }

  @Get('auctions')
  @UseGuards(JwtAuthGuard)
  async listAuctions(
    @Req() req,
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 0
  ) {
    return await this.auctionService.listAuctions(
      page,
      limit
    );
  }

  @Get('auctions/{:status}')
  @UseGuards(JwtAuthGuard)
  async listAuctionsFiltered(
    @Req() req,
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 0,
    @Param('status') status: string = ''
  ) {
    if (status !== '') return;

    return await this.auctionService.listAuctionsByStatus(
      status,
      page,
      limit
    );
  }

  //Todo: add tier info
  @Get('auction/{:id}')
  @UseGuards(JwtAuthGuard)
  async getAuction(
    @Req() req,
    @Param('id') id: number = 0
  ) {
    return await this.auctionService.getAuction(
      id
    );
  }
}
