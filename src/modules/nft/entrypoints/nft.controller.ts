import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Param,
  Get,
  Req,
  ClassSerializerInterceptor,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import {
  DeleteNftParams,
  UpdateCollectionBody,
  EditCollectionParams,
  EditMintingCollectionBody,
  EditMintingCollectionParams,
  EditMintingNftBody,
  EditNftBody,
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
  CreateCollectionBody,
  CreateNftBody,
  UploadNftMediaFileParams,
  GetCollectionQueryParams,
  UploadNftMediaFileBody,
} from './dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { NftService } from '../service_layer/nft.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { collectionBannerMulterOptions, collectionFileMulterOptions, nftFileMulterOptions } from './multipart';
import { classToPlain } from 'class-transformer';
import { constants } from '../../../common/constants';
import { NftStatusEnum } from '../../../common/constants/enums';

@Controller('api')
export class NftController {

  constructor(private nftService: NftService) {}

  @Post('/nfts')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create NFT for later minting' })
  async createNft(@Req() req, @Body() body: CreateNftBody) {
    return this.nftService.createNft({
      name: body.name,
      description: body.description,
      numberOfEditions: Number(body.numberOfEditions),
      properties: body.properties,
      royalties: body.royalties,
      collectionId: Number(body.collectionId),
      userId: req.user.sub,
      metadataStorage: body.metadataStorage,
      licenseUri: body.licenseUri,
    });
  }

  @Patch('/nfts/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiTags('nfts')
  @ApiParam({ name: 'id', description: 'The id of the modified saved NFT', example: 1, required: true })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save NFT for later minting' })
  async updateNft(@Req() req, @Param() params: PatchSavedNftParams, @Body() body: EditNftBody) {
    return await this.nftService.updateNft(params.id, req.user.sub, classToPlain(body) as any);
  }

  @Post('/nfts/:id/file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', nftFileMulterOptions()))
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload image for nft' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'The id of the nft', required: true, example: 1 })
  async uploadNftFile(
    @Req() req,
    @Param() params: UploadNftMediaFileParams,
    @Body() body: UploadNftMediaFileBody,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.nftService.uploadNftFile(params.id, req.user.sub, classToPlain(body) as any, file);
  }

  @Delete('/nfts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete saved NFT' })
  async deleteNft(@Req() req, @Param() params: DeleteNftParams) {
    return await this.nftService.deleteSavedNft(params.id, req.user.sub);
  }

  @Get('/nfts/saved')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the saved NFTs of an user' })
  async getSavedNfts(@Req() req) {
    return await this.nftService.getNfts({
      userId: req.user.sub,
      status: NftStatusEnum.SAVED,
    });
  }

  @Get('/nfts/minted')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my nfts' })
  @ApiResponse({ type: GetMyNftsResponse, status: 200, isArray: true })
  async getMintedNftsByUserId(@Req() req) {
    return await this.nftService.getMintedNftsByUserId(req.user.sub);
  }

  @Get('/nfts/my-nfts/availability')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my nfts with availability information' })
  @ApiResponse({ type: GetMyNftsResponse, status: 200, isArray: true })
  async getMyNftsAvailability(@Req() req, @Query() params: GetMyNftsAvailabilityParams) {
    return await this.nftService.getMyNftsAvailability(
      req.user.sub,
      params.start,
      params.limit,
      params.size,
      params.auctionId,
    );
  }

//   @Deprecated
//   @Get('saved-nfts/:id/token-uri')
//   // @UseGuards(JwtAuthGuard)
//   @ApiTags('nfts')
//   @ApiBearerAuth()
//   @ApiOperation({ summary: 'Generate the token URI for Saved NFT' })
//   @ApiParam({ name: 'id', description: 'The id of the nft', required: true, example: 1 })
//   @ApiResponse({ status: 200, description: 'The URLs for tokens metadata', type: 'string', isArray: true })
//   async getTokenURI(
//     @Req() req,
//     @Param() params: GetNftTokenURIParams
//   ) {
//     return await this.nftService.getSavedNftTokenURI(params.id, 1/*req.user.sub*/);
//   }

//   @Deprecated
//   @Post('nfts/token-uri')
//   // @UseGuards(JwtAuthGuard)
//   @UseInterceptors(FileInterceptor('file', nftFileMulterOptions()))
//   @ApiTags('nfts')
//   @ApiBearerAuth()
//   @ApiOperation({ summary: 'Generate the token URI for an NFT' })
//   @ApiConsumes('form/multi-part')
//   @ApiResponse({ status: 200, description: 'The URLs for tokens metadata', type: 'string', isArray: true })
//   async getNftTokenURI(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
//     return await this.nftService.getNftTokenURI(1/*req.user.sub*/, req.body, file);
//   }

//   @Deprecated
//   @Post('nfts/minting-collections')
//   @UseGuards(JwtAuthGuard)
//   @UseInterceptors(FileInterceptor('file', collectionFileMulterOptions()))
//   @ApiTags('nfts')
//   @ApiBearerAuth()
//   @ApiOperation({ summary: '' })
//   @ApiConsumes('form/multi-part')
//   async createCollection(@Req() req, @UploadedFile() file: Express.Multer.File) {
//     return await this.nftService.createCollection(req.user.sub, req.body, file);
//   }

//   @Deprecated
//   @Patch('nfts/minting-collections/:id')
//   @UseGuards(JwtAuthGuard)
//   @ApiTags('nfts')
//   @ApiBearerAuth()
//   @ApiOperation({ summary: 'Edit minting collection' })
//   async editMintingCollection(
//     @Req() req,
//     @Param() params: EditMintingCollectionParams,
//     @Body() body: EditMintingCollectionBody,
//   ) {
//     return await this.nftService.editMintingCollection(req.user.sub, params.id, body);
//   }

  @Post('/collections')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Collection for later deployment' })
  async createCollection(
    @Req() req, 
    @Body() body: CreateCollectionBody
  ) {
    return await this.nftService.createCollection(req.user.sub, body);
    // return this.nftService.saveCollectionForLater({
    //   name: body.name,
    //   symbol: body.symbol,
    //   userId: req.user.sub,
    //   collectibles: body.collectibles.map((collectible) => ({
    //     name: collectible.name,
    //     description: collectible.description,
    //     numberOfEditions: collectible.numberOfEditions,
    //     properties: collectible.properties,
    //   })),
    // });
  }

  @Post('/collections/:id/cover-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('cover', collectionFileMulterOptions()))
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change collection cover image (logo)' })
  @ApiConsumes('form/multi-part')
  async changeCollectionCover(
    @Req() req,
    @Param() params: EditCollectionParams,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.nftService.changeCollectionImage(params.id, req.user.sub, constants.NFT_COLLECTION_COVER, file);
  }

  @Post('/collections/:id/banner-image')
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
    return await this.nftService.changeCollectionImage(params.id, req.user.sub, constants.NFT_COLLECTION_BANNER, file);
  }

  @Patch('/collections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit collection' })
  async updateCollection(
    @Req() req, 
    @Param() params: EditCollectionParams, 
    @Body() body: UpdateCollectionBody
  ) {
    return await this.nftService.updateCollection(params.id, req.user.sub, body);
  }

  @Get('/collections')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the list of all my collections' })
  async getMyCollections(@Req() req, @Query() params: GetMyCollectionsParams) {
    if (params.deployable === 'true') {
      return await this.nftService.getDeployableCollectionsByUserId(req.user.sub);
    }
    return await this.nftService.getDeployedCollectionsByUserId(req.user.sub);
  }

  @Get('/pages/user-profile/:username/nfts')
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Get user NFTs' })
  @ApiResponse({ type: GetUserNftsResponse, status: 200, isArray: true })
  async getUserNfts(@Param() params: GetUserNftsParams) {
    return await this.nftService.getNftsByUserWalletAddress(params.username);
  }

  @Get('/pages/collection/:address')
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Get data for Collection page' })
  async getCollectionPage(@Param() params: GetCollectionParams, @Query() query: GetCollectionQueryParams) {
    return this.nftService.getCollectionPage(params.address, query.name, query.offset, query.limit);
  }

  @Get('/pages/my-nfts')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiOperation({ summary: 'My NFTs page' })
  @ApiBearerAuth()
  async getMyNftsPage(@Req() req) {
    return this.nftService.getMyNftsPage(req.user.sub);
  }

  @Get('/pages/my-collections/pending')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Get data to populate the pending section of My Collections page' })
  @ApiBearerAuth()
  async getMyCollectionsPending(@Req() req) {
    return this.nftService.getMyCollectionsPendingPage(req.user.sub);
  }

  @Get('/pages/my-collections/pending/count')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Get count of the collections in minting state' })
  @ApiBearerAuth()
  async getMyCollectionsPendingCount(@Req() req) {
    return this.nftService.getMyCollectionsPendingCount(req.user.sub);
  }

  @Get('/pages/my-nfts/pending')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Pending NFTs for My NFTs page' })
  @ApiBearerAuth()
  async getMyNftsPendingPage(@Req() req) {
    return this.nftService.getMyNftsPendingPage(req.user.sub);
  }

  @Get('/pages/my-nfts/pending/count')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Get count of the nfts in minting state' })
  @ApiBearerAuth()
  async getMyNftsPendingCount(@Req() req) {
    return this.nftService.getMyNftsPendingCount(req.user.sub);
  }

  @Get('/pages/nft/:collectionAddress/:tokenId')
  @ApiTags('nfts')
  @ApiOperation({ summary: 'Get data for NFT page' })
  async getNFTPage(@Param() params: GetNftParams) {
    return this.nftService.getNftPage(params.collectionAddress, params.tokenId);
  }
}
