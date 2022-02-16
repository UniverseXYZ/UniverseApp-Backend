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
  EditAuctionBody,
  EditAuctionParams,
  EditRewardTierResponse,
  GetAuctionPageParams,
  GetMyAuctionsQuery,
  GetMyAuctionsResponse,
  UpdateRewardTierBody,
  UpdateRewardTierParams,
  UploaductionLandingImagesParams,
  AddRewardTierBodyParams,
  GetAuctionsQuery,
  DeleteImageParams,
  ValidateUrlParams,
  GetUserBidsParams,
} from './dto';
import { AuctionService } from '../service-layer/auction.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
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
    return await this.auctionService.createAuction(req.user.sub, req.user.address, createAuctionBody);
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
    return await this.auctionService.updateAuction(req.user.address, editAuctionParams.id, updateAuctionBody);
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
    return await this.auctionService.uploadAuctionLandingImages(
      req.user.address,
      params.id,
      promoImage,
      backgroundImage,
    );
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
      req.user.address,
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
      req.user.address,
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
      req.user.address,
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
      query.address,
      parseInt(query.limit) || undefined,
      parseInt(query.offset) || undefined,
      query.filters,
      query.search,
    );
  }

  @Get('/pages/auctions/active')
  @ApiTags('auction')
  @ApiOperation({ summary: 'Get active auctions for Universe Auction House' })
  @ApiResponse({ type: GetMyAuctionsResponse, status: 200 })
  async getActiveAuctions(@Query() query: GetAuctionsQuery) {
    return await this.auctionService.getActiveAuctions(
      query.address,
      parseInt(query.limit) || undefined,
      parseInt(query.offset) || undefined,
      query.filters,
      query.search,
    );
  }

  @Get('/pages/auctions/future')
  @ApiTags('auction')
  @ApiOperation({ summary: 'Get future auctions for Universe Auction House' })
  @ApiResponse({ type: GetMyAuctionsResponse, status: 200 })
  async getFutureAuctions(@Query() query: GetAuctionsQuery) {
    return await this.auctionService.getFutureAuctions(
      query.address,
      parseInt(query.limit) || undefined,
      parseInt(query.offset) || undefined,
      query.filters,
      query.search,
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
    return await this.auctionService.cancelFutureAuction(req.user.address, id);
  }

  @Post('/add-reward-tier')
  @UseGuards(JwtAuthGuard)
  @ApiTags('auction')
  @ApiOperation({ summary: 'Add a Reward Tier to a Specific Auction' })
  @ApiResponse({ type: EditRewardTierResponse, status: 200 })
  async createRewardTier(@Req() req, @Body() addRewardTierBodyParams: AddRewardTierBodyParams) {
    return await this.auctionService.createRewardTier(req.user.address, req.user.sub, addRewardTierBodyParams);
  }

  @Delete('/reward-tiers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiTags('auction')
  @ApiOperation({ summary: 'Remove a Reward Tier from a specific Auction' })
  @ApiResponse({ type: EditRewardTierResponse, status: 200 })
  async removeRewardTier(@Req() req, @Param('id') id) {
    return await this.auctionService.removeRewardTier(req.user.sub, id);
  }

  @Post('/reward-tier-image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadRewardsTierImage(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const ret = await this.auctionService.updateRewardTierImage(req.user, req.body.tierId, file);
    return ret;
  }

  @Get('pages/my-bids/:address')
  @UseGuards(JwtAuthGuard)
  async getUserBids(@Req() req, @Param('address') address, @Query() query: GetUserBidsParams) {
    return await this.auctionService.getUserBids(
      address,
      parseInt(query.limit) || undefined,
      parseInt(query.offset) || undefined,
      query.search,
    );
  }

  @Delete('auction/images')
  @UseGuards(JwtAuthGuard)
  async deleteImage(@Req() req, @Body() deleteImageParams: DeleteImageParams) {
    return await this.auctionService.deleteImage(req.user.sub, deleteImageParams.id, deleteImageParams.type);
  }

  @Get('auction/validate/:url')
  @ApiTags('auction')
  async validateUrl(@Param('url') url, @Query() query: ValidateUrlParams) {
    return await this.auctionService.validateUrl(url, query.auctionId);
  }

  @Get('auction/:address/summary')
  @ApiTags('auction')
  @ApiOperation({ summary: 'Get count of active and future auctions' })
  async getAuctionSummary(@Param('address') address) {
    return await this.auctionService.getAuctionSummary(address);
  }
}
