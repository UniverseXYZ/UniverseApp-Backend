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
} from '@nestjs/common';
import {
  DeleteSavedNftParams,
  EditCollectionBody,
  EditCollectionParams,
  EditMintingCollectionBody,
  EditMintingCollectionParams,
  EditSavedNftBody,
  GetMyCollectionParams,
  GetMyNftsResponse,
  GetNftTokenURIParams,
  PatchSavedNftParams,
  SaveCollectionBody,
  SaveNftBody,
  UploadNftMediaFileParams,
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
  @UseInterceptors(ClassSerializerInterceptor)
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
    return await this.nftService.uploadMediaFile(params.id, file);
  }

  @Get('saved-nfts/:id/token-uri')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate the token URI for Saved NFT' })
  @ApiParam({ name: 'id', description: 'The id of the nft', required: true, example: 1 })
  @ApiResponse({ status: 200, description: 'The URLs for tokens metadata', type: 'string', isArray: true })
  async getTokenURI(@Param() params: GetNftTokenURIParams) {
    return await this.nftService.getTokenURI(params.id);
  }

  @Post('nfts/token-uri')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', nftFileMulterOptions()))
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate the token URI for an NFT' })
  @ApiConsumes('form/multi-part')
  @ApiResponse({ status: 200, description: 'The URLs for tokens metadata', type: 'string', isArray: true })
  async getNftTokenURI(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    return await this.nftService.getNftTokenURI(req.body, file);
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

  @Post('collections/:id/cover-image')
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
    return await this.nftService.changeCollectionCoverImage(params.id, req.user.sub, file);
  }

  @Post('collections/:id/banner-image')
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
    return await this.nftService.changeCollectionBannerImage(params.id, req.user.sub, file);
  }

  @Patch('collections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit collection' })
  async editCollection(@Req() req, @Param() params: EditCollectionParams, @Body() body: EditCollectionBody) {
    return await this.nftService.editCollection(params.id, req.user.sub, body);
  }

  @Get('saved-nfts')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the saved NFTs of an user' })
  async getSavedNfts(@Req() req) {
    return await this.nftService.getSavedNfts(req.user.sub);
  }

  @Get('nfts/my-nfts')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my nfts' })
  @ApiResponse({ type: GetMyNftsResponse, status: 200, isArray: true })
  async getMyNfts(@Req() req) {
    return await this.nftService.getMyNfts(req.user.sub);
  }

  @Get('nfts/my-nfts/availability')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my nfts with availability information' })
  @ApiResponse({ type: GetMyNftsResponse, status: 200, isArray: true })
  async getMyNftsAvailability(@Req() req) {
    return await this.nftService.getMyNftsAvailability(req.user.sub);
  }

  @Get('nfts/collections/my-collections')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the list of all my collections' })
  async getMyCollections(@Req() req) {
    return await this.nftService.getMyCollections(req.user.sub);
  }

  @Delete('saved-nfts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete saved NFT' })
  async deleteSavedNft(@Req() req, @Param() params: DeleteSavedNftParams) {
    return await this.nftService.deleteSavedNft(params.id, req.user.sub);
  }

  @Get('pages/my-collections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get data for My Collection page' })
  async getMyCollectionPage(@Req() req, @Param() params: GetMyCollectionParams) {
    return this.nftService.getMyCollection(req.user.sub, params.id);
  }
}
