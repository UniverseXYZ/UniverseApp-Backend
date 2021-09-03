import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  CreateAuctionBody,
  CreateRewardTierBody,
  EditAuctionBody,
  EditAuctionParams,
  EditRewardTierResponse,
  GetAuctionPageParams,
  GetMyAuctionsQuery, GetMyAuctionsResponse,
  UpdateAuctionExtraBody,
  UpdateRewardTierBody,
  UpdateRewardTierExtraBody,
  UpdateRewardTierParams,
  UploaductionLandingImagesParams,
} from './dto';
import { AuctionService } from '../service-layer/auction.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { auctionLandingImagesMulterOptions } from '../../nft/entrypoints/multipart';
import { classToPlain } from 'class-transformer';

@Controller('api')
export class AuctionController {
  constructor(private auctionService: AuctionService) {}

  @Post('/auctions')
  @ApiTags('auction')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new auction' })
  async createAuction(@Req() req, @Body() createAuctionBody: CreateAuctionBody) {
    return await this.auctionService.createAuction(req.user.sub, createAuctionBody);
  }

  @Patch('auctions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiTags('auction')
  @ApiOperation({ summary: 'Edit auction' })
  async updateAuction(
    @Req() req,
    @Param() editAuctionParams: EditAuctionParams,
    @Body() updateAuctionBody: EditAuctionBody,
  ) {
    return await this.auctionService.updateAuction(req.user.sub, editAuctionParams.id, updateAuctionBody);
  }

  @Post('auctions/:id/landing-files')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'promo-image' }, { name: 'background-image' }], auctionLandingImagesMulterOptions()),
  )
  @ApiTags('auction')
  @ApiOperation({ summary: 'Upload images for the landing page' })
  async uploadAuctionLandingImages(
    @Req() req,
    @Param() params: UploaductionLandingImagesParams,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  ) {
    const promoImage = files && files['promo-image'] && files['promo-image'][0];
    const backgroundImage = files && files['background-image'] && files['background-image'][0];
    return await this.auctionService.uploadAuctionLandingImages(req.user.sub, params.id, promoImage, backgroundImage);
  }

  @Patch('reward-tiers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiTags('auction')
  @ApiOperation({ summary: 'Edit the Reward Tier' })
  @ApiResponse({ type: EditRewardTierResponse, status: 200 })
  async updateRewardTier(
    @Req() req,
    @Param() params: UpdateRewardTierParams,
    @Body() updateRewardTierBody: UpdateRewardTierBody,
  ) {
    return await this.auctionService.updateRewardTier(
      req.user.sub,
      params.id,
      classToPlain(updateRewardTierBody) as any,
    );
  }

  @Get('pages/my-auctions/future')
  @UseGuards(JwtAuthGuard)
  @ApiTags('auction')
  @ApiOperation({ summary: 'Get my future auctions' })
  @ApiResponse({ type: GetMyAuctionsResponse, status: 200 })
  async getMyFutureAuctions(@Req() req, @Query() query: GetMyAuctionsQuery) {
    return await this.auctionService.getMyFutureAuctionsPage(
      req.user.sub,
      parseInt(query.limit) || undefined,
      parseInt(query.offset) || undefined,
    );
  }

  @Get('pages/my-auctions/active')
  @UseGuards(JwtAuthGuard)
  @ApiTags('auction')
  @ApiOperation({ summary: 'Get my active auctions' })
  @ApiResponse({ type: GetMyAuctionsResponse, status: 200 })
  async getMyActiveAuctions(@Req() req, @Query() query: GetMyAuctionsQuery) {
    return await this.auctionService.getMyActiveAuctionsPage(
      req.user.sub,
      parseInt(query.limit) || undefined,
      parseInt(query.offset) || undefined,
    );
  }

  @Get('pages/my-auctions/past')
  @UseGuards(JwtAuthGuard)
  @ApiTags('auction')
  @ApiOperation({ summary: 'Get my past auctions' })
  @ApiResponse({ type: GetMyAuctionsResponse, status: 200 })
  async getMyPastAuctions(@Req() req, @Query() query: GetMyAuctionsQuery) {
    return await this.auctionService.getMyPastAuctionsPage(
      req.user.sub,
      parseInt(query.limit) || undefined,
      parseInt(query.offset) || undefined,
    );
  }

  @Get('pages/auctions/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiTags('auction')
  @ApiOperation({ summary: 'Get the public page of the auction' })
  async getAuctionPage(@Req() req, @Param() params: GetAuctionPageParams) {
    return await this.auctionService.getAuctionPage(req.user.sub, parseInt(params.id));
  }

  /**
   * old endpoints
   */
  //Todo: add endpoint to get reward tier ?
  //Todo: needs to check that there are enough nfts, and that the nfts are not already set as rewards in other tiers
  @Post('reward-tier')
  @UseGuards(JwtAuthGuard)
  async createRewardTier(@Req() req, @Body() createRewardTierBody: CreateRewardTierBody) {
    // return await this.auctionService.createRewardTier(req.user.sub, createRewardTierBody.auctionId, {
    //   name: createRewardTierBody.name,
    //   numberOfWinners: createRewardTierBody.numberOfWinners,
    //   nftsPerWinner: createRewardTierBody.nftsPerWinner,
    //   nftIds: createRewardTierBody.nftIds,
    //   minimumBid: createRewardTierBody.minimumBid,
    //   tierPosition: createRewardTierBody.tierPosition,
    // });
  }

  @Patch('reward-tier-extra-data')
  @UseGuards(JwtAuthGuard)
  async updateRewardTierExtraData(@Req() req, @Body() updateRewardTierExtraBody: UpdateRewardTierExtraBody) {
    return await this.auctionService.updateRewardTierExtraData(req.user.sub, updateRewardTierExtraBody.tierId, {
      customDescription: updateRewardTierExtraBody.customDescription,
      tierColor: updateRewardTierExtraBody.tierColor,
    });
  }

  @Post('/reward-tier-image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadRewardsTierImage(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const ret = await this.auctionService.updateRewardTierImage(req.user, req.body.tierId, file);
    return ret;
  }

  @Patch('auction-extra-data')
  @UseGuards(JwtAuthGuard)
  async updateAuctionExtraData(@Req() req, @Body() updateAuctionExtraBody: UpdateAuctionExtraBody) {
    return await this.auctionService.updateAuctionExtraData(req.user.sub, updateAuctionExtraBody.auctionId, {
      headline: updateAuctionExtraBody.headline,
      link: updateAuctionExtraBody.link,
      backgroundBlur: updateAuctionExtraBody.backgroundBlur,
    });
  }

  @Post('/auction-promo-image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadAuctionPromoImage(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const ret = await this.auctionService.updateAuctionPromoImage(req.user, req.body.auctionId, file);
    return ret;
  }

  @Post('/auction-background-image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadAuctionBackgroundImage(@UploadedFile() file: Express.Multer.File, @Req() req) {
    console.log(req);
    const ret = await this.auctionService.updateAuctionBackgroundImage(req.user, req.body.auctionId, file);
    return ret;
  }

  @Get('auctions/byUser')
  @UseGuards(JwtAuthGuard)
  async listAuctionsByUser(@Req() req, @Query('page') page: number = 0, @Query('limit') limit: number = 0) {
    return await this.auctionService.listAuctionsByUser(req.user.sub, page, limit);
  }

  @Get('auctions/byUser/{:status}')
  @UseGuards(JwtAuthGuard)
  async listAuctionsByUserFiltered(
    @Req() req,
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 0,
    @Param('status') status: string = '',
  ) {
    if (status !== '') return;

    return await this.auctionService.listAuctionsByUserAndStatus(req.user.sub, status, page, limit);
  }

  @Get('auctions')
  @UseGuards(JwtAuthGuard)
  async listAuctions(@Req() req, @Query('page') page: number = 0, @Query('limit') limit: number = 0) {
    return await this.auctionService.listAuctions(page, limit);
  }

  @Get('auctions/{:status}')
  @UseGuards(JwtAuthGuard)
  async listAuctionsFiltered(
    @Req() req,
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 0,
    @Param('status') status: string = '',
  ) {
    if (status !== '') return;

    return await this.auctionService.listAuctionsByStatus(status, page, limit);
  }

  //Todo: add tier info
  @Get('auction/{:id}')
  @UseGuards(JwtAuthGuard)
  async getAuction(@Req() req, @Param('id') id: number = 0) {
    return await this.auctionService.getAuction(id);
  }
}
