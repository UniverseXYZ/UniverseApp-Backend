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
} from '@nestjs/common';
import {
  EditMintingCollectionBody,
  EditMintingCollectionParams,
  EditSavedNftBody,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { collectionFileMulterOptions, nftFileMulterOptions } from './multipart';
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
  async getNftTokenURI(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    return await this.nftService.getNftTokenURI(req.body, file);
  }

  @Post('nfts/minting-collections')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', collectionFileMulterOptions()))
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate the token URI for an NFT' })
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

  @Get('nfts/collections/my-collections')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the list of all my collections' })
  async getMyCollections(@Req() req) {
    return await this.nftService.getMyCollections(req.user.sub);
  }
}
