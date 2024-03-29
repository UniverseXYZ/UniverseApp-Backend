import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Param,
  Get,
  Req,
  ClassSerializerInterceptor,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import {
  DeleteSavedNftParams,
  EditCollectionBody,
  EditCollectionParams,
  EditMintingCollectionBody,
  EditMintingCollectionParams,
  EditMintingNftBody,
  EditSavedNftBody,
  GetCollectionParams,
  GetMyCollectionsParams,
  GetMyNftsResponse,
  GetNftParams,
  GetMyNftsAvailabilityParams,
  GetNftTokenURIParams,
  GetUserNftsParams,
  GetUserNftsResponse,
  PatchMintingNftParams,
  PatchSavedNftParams,
  SaveCollectionBody,
  SaveNftBody,
  UploadNftMediaFileParams,
  GetCollectionQueryParams,
  GetMyNftsParams,
  GetSavedNftsParams,
  GetMyNftsPendingParams,
  GetMyCollectionsPendingParams,
  GetUserNftsQueryParams,
  GetMyNftsPageParams,
  GetMyCollectionsTabParams,
} from './dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { NftService } from '../service_layer/nft.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { collectionBannerMulterOptions, collectionFileMulterOptions, nftFileMulterOptions } from './multipart';
import { classToPlain } from 'class-transformer';

@Controller('api')
export class NftController {
  constructor(private nftService: NftService) {}

  @Post('/saved-nfts')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save NFT for later minting' })
  async saveSingleNft(@Req() req, @Body() body: SaveNftBody) {
    return this.nftService.saveForLater({
      name: body.name,
      description: body.description,
      numberOfEditions: body.numberOfEditions,
      properties: body.properties,
      royalties: body.royalties,
      collectionId: body.collectionId,
      userId: req.user.sub,
    });
  }

  @Patch('/saved-nfts/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiTags('nfts')
  @ApiParam({ name: 'id', description: 'The id of the modified saved NFT', example: 1, required: true })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save NFT for later minting' })
  async editSavedNft(@Req() req, @Param() params: PatchSavedNftParams, @Body() body: EditSavedNftBody) {
    return await this.nftService.editSavedNft(params.id, req.user.sub, classToPlain(body) as any);
  }

  @Patch('/minting-nfts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiParam({ name: 'id', description: 'The id of the minting NFT', example: 1, required: true })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit minting NFT' })
  async editMintingNft(@Req() req, @Param() params: PatchMintingNftParams, @Body() body: EditMintingNftBody) {
    return await this.nftService.editMintingNft(params.id, req.user.sub, body);
  }

  // @Post('/collections')
  // @UseGuards(JwtAuthGuard)
  // @ApiTags('nfts')
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Save Collection for later minting' })
  // async saveCollection(@Req() req, @Body() body: SaveCollectionBody) {
  //   return this.nftService.saveCollectionForLater({
  //     name: body.name,
  //     symbol: body.symbol,
  //     userId: req.user.sub,
  //     collectibles: body.collectibles.map((collectible) => ({
  //       name: collectible.name,
  //       description: collectible.description,
  //       numberOfEditions: collectible.numberOfEditions,
  //       properties: collectible.properties,
  //     })),
  //   });
  // }

  @Post('/saved-nfts/:id/file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', nftFileMulterOptions()))
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload image for nft' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'The id of the nft', required: true, example: 1 })
  async uploadNftMediaFile(
    @Req() req,
    @Param() params: UploadNftMediaFileParams,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.nftService.uploadSavedNftFile(params.id, req.user.sub, file);
  }

  @Get('saved-nfts/:id/token-uri')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate the token URI for Saved NFT' })
  @ApiParam({ name: 'id', description: 'The id of the nft', required: true, example: 1 })
  @ApiResponse({ status: 200, description: 'The URLs for tokens metadata', type: 'string', isArray: true })
  async getTokenURI(@Req() req, @Param() params: GetNftTokenURIParams) {
    return await this.nftService.getSavedNftTokenURI(params.id, req.user.sub);
  }

  @Post('nfts/token-uri')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', nftFileMulterOptions()))
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate the token URI for an NFT' })
  @ApiConsumes('form/multi-part')
  @ApiResponse({ status: 200, description: 'The URLs for tokens metadata', type: 'string', isArray: true })
  async getNftTokenURI(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return await this.nftService.getNftTokenURI(req.user.sub, req.body, file);
  }

  @Post('nfts/minting-collections')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', collectionFileMulterOptions()))
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: '' })
  @ApiConsumes('form/multi-part')
  async createCollection(@Req() req, @UploadedFile() file: Express.Multer.File) {
    return await this.nftService.createCollection(req.user.sub, req.body, file);
  }

  @Patch('nfts/minting-collections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit minting collection' })
  async editMintingCollection(
    @Req() req,
    @Param() params: EditMintingCollectionParams,
    @Body() body: EditMintingCollectionBody,
  ) {
    return await this.nftService.editMintingCollection(req.user.sub, params.id, body);
  }

  @Post('collections/:address/cover-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('cover', collectionFileMulterOptions()))
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change collection cover image' })
  @ApiConsumes('form/multi-part')
  async changeCollectionCover(
    @Req() req,
    @Param() params: EditCollectionParams,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.nftService.changeCollectionCoverImage(params.address, req.user.address, file);
  }

  @Post('collections/:address/banner-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('banner', collectionBannerMulterOptions()))
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change collection banner image' })
  @ApiConsumes('form/multi-part')
  async editCollectionBanner(
    @Req() req,
    @Param() params: EditCollectionParams,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.nftService.changeCollectionBannerImage(params.address, req.user.address, file);
  }

  @Patch('collections/:address')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit collection' })
  async editCollection(@Req() req, @Param() params: EditCollectionParams, @Body() body: EditCollectionBody) {
    return await this.nftService.editCollection(params.address, req.user.address, body);
  }

  @Get('saved-nfts')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the saved NFTs of an user' })
  async getSavedNfts(@Req() req, @Query() params: GetSavedNftsParams) {
    return await this.nftService.getSavedNfts(req.user.sub, params.limit, params.offset);
  }

  @Get('nfts/my-nfts')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my nfts' })
  @ApiResponse({ type: GetMyNftsResponse, status: 200, isArray: true })
  async getMyNfts(@Req() req, @Query() params: GetMyNftsParams) {
    return await this.nftService.getMyNfts(req.user.address, params.limit, params.offset);
  }

  @Get('pages/user-profile/:username/nfts')
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Get user NFTs' })
  @ApiResponse({ type: GetUserNftsResponse, status: 200, isArray: true })
  async getUserNfts(@Param() params: GetUserNftsParams, @Query() query: GetUserNftsQueryParams) {
    return await this.nftService.getUserNfts(params.username, query.limit, query.offset, query.name, query.collections);
  }

  // @Get('pages/user-profile/:address/collections')
  // @ApiTags('nfts')
  // @ApiOperation({ summary: 'Get user Collections' })
  // @ApiResponse({ type: GetUserNftsResponse, status: 200, isArray: true })
  // async getUserCollections(@Param() params: GetUserNftsParams, @Query() query: GetUserNftsQueryParams) {
  //   return await this.nftService.getUserCollections(params.address, query.limit, query.offset);
  // }

  @Get('nfts/my-nfts/availability')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my nfts with availability information' })
  @ApiResponse({ type: GetMyNftsResponse, status: 200, isArray: true })
  async getMyNftsAvailability(@Req() req, @Query() params: GetMyNftsAvailabilityParams) {
    return await this.nftService.getMyNftsAvailability(req.user.sub, params.start, params.limit, params.size);
  }

  @Get('nfts/collections/my-collections')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the list of all my collections' })
  async getMyCollections(@Req() req, @Query() params: GetMyCollectionsParams) {
    if (params.mintable === 'true') {
      return await this.nftService.getMyMintableCollections(req.user.sub);
    }
    return await this.nftService.getMyNftsCollections(req.user.address);
  }

  @Get('nfts/collections/:address')
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Get the list of collections for a specific user' })
  async getUserCollections(@Req() req, @Param() params: { address: string }) {
    return await this.nftService.getMyNftsCollections(params.address);
  }

  @Get('pages/my-nfts/collections')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the list of all my collections' })
  async getMyNftsCollections(@Req() req, @Query() params: GetMyCollectionsTabParams) {
    return await this.nftService.getMyCollectionsTab(req.user.sub, params.limit, params.offset);
  }

  @Delete('saved-nfts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete saved NFT' })
  async deleteSavedNft(@Req() req, @Param() params: DeleteSavedNftParams) {
    return await this.nftService.deleteSavedNft(params.id, req.user.sub);
  }

  @Get('pages/collection/:address')
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Get data for Collection page' })
  async getCollectionPage(@Param() params: GetCollectionParams, @Query() query: GetCollectionQueryParams) {
    return this.nftService.getCollectionPage(params.address, query.name, query.offset, query.limit);
  }

  @Get('pages/my-nfts')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiOperation({ summary: 'My NFTs page' })
  @ApiBearerAuth()
  async getMyNftsPage(@Req() req, @Query() params: GetMyNftsPageParams) {
    return this.nftService.getMyNftsPage(
      req.user.address,
      params.limit,
      params.offset,
      params.name,
      params.collections,
    );
  }

  @Get('pages/my-collections/pending')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Get data to populate the pending section of My Collections page' })
  @ApiBearerAuth()
  async getMyCollectionsPending(@Req() req) {
    return this.nftService.getMyCollectionsPendingPage(req.user.sub);
  }

  @Get('pages/my-collections/pending/count')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Get count of the collections in minting state' })
  @ApiBearerAuth()
  async getMyCollectionsPendingCount(@Req() req) {
    return this.nftService.getMyCollectionsPendingCount(req.user.sub);
  }

  @Get('pages/my-nfts/pending')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Pending NFTs for My NFTs page' })
  @ApiBearerAuth()
  async getMyNftsPendingPage(@Req() req) {
    return this.nftService.getMyNftsPendingPage(req.user.sub);
  }

  @Get('pages/my-nfts/pending/count')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Get count of the nfts in minting state' })
  @ApiBearerAuth()
  async getMyNftsPendingCount(@Req() req) {
    return this.nftService.getMyNftsPendingCount(req.user.sub);
  }

  @Get('pages/nft/:collectionAddress/:tokenId')
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Get data for NFT page' })
  async getNFTPage(@Param() params: GetNftParams) {
    return this.nftService.getNftPage(params.collectionAddress, params.tokenId);
  }

  @Get('pages/my-nfts/summary')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Get count of the nfts, collections, saved nfts' })
  @ApiBearerAuth()
  async getMyNftsSummary(@Req() req) {
    return this.nftService.getMyNftsSummary(req.user.address);
  }
}
