import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
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
  GetMyAuctionsQuery,
  GetMyAuctionsResponse,
  PlaceBidBody,
  UpdateAuctionExtraBody,
  UpdateRewardTierBody,
  UpdateRewardTierExtraBody,
  UpdateRewardTierParams,
  UploaductionLandingImagesParams,
  WithdrawNftsBody,
  DepositNftsBody,
  ChangeAuctionStatus,
  AddRewardTierBodyParams,
  GetAuctionsQuery,
} from './dto';
import { AuctionService } from '../service-layer/auction.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { auctionLandingImagesMulterOptions, rewardTierImagesMulterOptions } from '../../nft/entrypoints/multipart';

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

  @Post('/auctions/cancel/:auctionId')
  @ApiTags('auction')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Set on chain properies of auction' })
  async cancelOnChainAuction(@Req() req, @Param('auctionId') auctionId: number) {
    return await this.auctionService.cancelOnChainAuction(req.user.sub, auctionId);
  }

  @Post('/auctions/depositNfts')
  @ApiTags('auction')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Set nfts as deposited' })
  async depositNfts(@Req() req, @Body() deployNftsBody: DepositNftsBody) {
    return await this.auctionService.depositNfts(req.user.sub, deployNftsBody);
  }

  @Post('/auctions/withdrawNfts')
  @ApiTags('auction')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Set nfts as withdrawn' })
  async withdrawNfts(@Req() req, @Body() withdrawNftsBody: WithdrawNftsBody) {
    return await this.auctionService.withdrawNfts(req.user.sub, withdrawNftsBody);
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
    return await this.auctionService.updateRewardTier(req.user.sub, parseInt(params.id), updateRewardTierBody);
  }

  @Patch('reward-tiers/:id/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', rewardTierImagesMulterOptions()))
  @ApiTags('reward tiers')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change reward tier image' })
  @ApiConsumes('form/multi-part')
  async changeRewardTierImage(
    @Req() req,
    @Param() params: UpdateRewardTierParams,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.auctionService.updateRewardTierImage(req.user.sub, parseInt(params.id), file);
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

  @Get('/pages/my-auctions/past')
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

  @Get('/pages/auctions/past')
  @ApiTags('auction')
  @ApiOperation({ summary: 'Get past auctions' })
  @ApiResponse({ type: GetMyAuctionsResponse, status: 200 })
  async getPastAuctions(@Query() query: GetAuctionsQuery) {
    return await this.auctionService.getPastAuctions(
      parseInt(query.userId),
      parseInt(query.limit) || undefined,
      parseInt(query.offset) || undefined,
      query.filters,
    );
  }

  @Get('/pages/auctions/active')
  @ApiTags('auction')
  @ApiOperation({ summary: 'Get active auctions' })
  @ApiResponse({ type: GetMyAuctionsResponse, status: 200 })
  async getActiveAuctions(@Query() query: GetAuctionsQuery) {
    return await this.auctionService.getActiveAuctions(
      parseInt(query.userId),
      parseInt(query.limit) || undefined,
      parseInt(query.offset) || undefined,
      query.filters,
    );
  }

  @Get('/pages/auctions/future')
  @ApiTags('auction')
  @ApiOperation({ summary: 'Get future auctions' })
  @ApiResponse({ type: GetMyAuctionsResponse, status: 200 })
  async getFutureAuctions(@Query() query: GetAuctionsQuery) {
    return await this.auctionService.getFutureAuctions(
      parseInt(query.userId),
      parseInt(query.limit) || undefined,
      parseInt(query.offset) || undefined,
      query.filters,
    );
  }

  @Get('pages/auctions/:username/:auctionName')
  @ApiTags('auction')
  @ApiOperation({ summary: 'Get the public page of the auction' })
  async getAuctionPage(@Req() req, @Param() params: GetAuctionPageParams) {
    return await this.auctionService.getAuctionPage(params.username, params.auctionName);
  }

  @Delete('auctions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiTags('auction')
  @ApiOperation({ summary: 'Cancel my future auction' })
  async cancelAuction(@Req() req, @Param('id') id) {
    return await this.auctionService.cancelFutureAuction(req.user.sub, id);
  }

  @Post('/add-reward-tier')
  @UseGuards(JwtAuthGuard)
  @ApiTags('auction')
  @ApiOperation({ summary: 'Add a Reward Tier to a Specific Auction' })
  @ApiResponse({ type: EditRewardTierResponse, status: 200 })
  async createRewardTier(@Req() req, @Body() addRewardTierBodyParams: AddRewardTierBodyParams) {
    return await this.auctionService.createRewardTier(req.user.sub, addRewardTierBodyParams);
  }

  @Delete('/reward-tiers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiTags('auction')
  @ApiOperation({ summary: 'Remove a Reward Tier from a specific Auction' })
  @ApiResponse({ type: EditRewardTierResponse, status: 200 })
  async removeRewardTier(@Req() req, @Param('id') id) {
    return await this.auctionService.removeRewardTier(req.user.sub, id);
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
  async listAuctionsByUser(@Req() req, @Query('page') page = 0, @Query('limit') limit = 0) {
    return await this.auctionService.listAuctionsByUser(req.user.sub, page, limit);
  }

  @Get('auctions/byUser/{:status}')
  @UseGuards(JwtAuthGuard)
  async listAuctionsByUserFiltered(
    @Req() req,
    @Query('page') page = 0,
    @Query('limit') limit = 0,
    @Param('status') status = '',
  ) {
    if (status !== '') return;

    return await this.auctionService.listAuctionsByUserAndStatus(req.user.sub, status, page, limit);
  }

  @Get('auctions')
  @UseGuards(JwtAuthGuard)
  async listAuctions(@Req() req, @Query('page') page = 0, @Query('limit') limit = 0) {
    return await this.auctionService.listAuctions(page, limit);
  }

  @Get('auctions/{:status}')
  @UseGuards(JwtAuthGuard)
  async listAuctionsFiltered(
    @Req() req,
    @Query('page') page = 0,
    @Query('limit') limit = 0,
    @Param('status') status = '',
  ) {
    if (status !== '') return;

    return await this.auctionService.listAuctionsByStatus(status, page, limit);
  }

  @Post('auction/placeBid')
  @UseGuards(JwtAuthGuard)
  async placeAuctionBid(@Req() req, @Body() placeBidBody: PlaceBidBody) {
    return await this.auctionService.placeAuctionBid(req.user.sub, placeBidBody);
  }

  @Delete('auction/:id/cancelBid')
  @UseGuards(JwtAuthGuard)
  async cancelAuctionBid(@Req() req, @Param('id') auctionId = 0) {
    return await this.auctionService.cancelAuctionBid(req.user.sub, auctionId);
  }

  @Get('pages/my-bids')
  @UseGuards(JwtAuthGuard)
  async getUserBids(@Req() req) {
    return await this.auctionService.getUserBids(req.user.sub);
  }

  //Todo: add tier info
  @Get('auction/{:id}')
  @UseGuards(JwtAuthGuard)
  async getAuction(@Req() req, @Param('id') id = 0) {
    return await this.auctionService.getAuction(id);
  }

  @Patch('auction/status')
  @UseGuards(JwtAuthGuard)
  async changeAuctionStatus(@Req() req, @Body() changeAuctionStatusBody: ChangeAuctionStatus) {
    return await this.auctionService.changeAuctionStatus(req.user.sub, changeAuctionStatusBody);
  }
}
