import { Body, Controller, Post, UseGuards, Request, UseInterceptors, UploadedFile, Param, Get } from '@nestjs/common';
import { GetNftTokenURIParams, SaveCollectionBody, SaveNftBody, UploadNftMediaFileParams } from './dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { NftService } from '../service_layer/nft.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './multipart';

@Controller('api')
export class NftController {
  constructor(private nftService: NftService) {}

  @Post('/nfts')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save NFT for later minting' })
  async saveSingleNft(@Request() req, @Body() body: SaveNftBody) {
    return this.nftService.saveForLater({
      name: body.name,
      description: body.description,
      numberOfEditions: body.numberOfEditions,
      properties: body.properties,
      royalties: body.royalties,
      userId: req.user.sub,
    });
  }

  @Post('/collections')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save Collection for later minting' })
  async saveCollection(@Request() req, @Body() body: SaveCollectionBody) {
    return this.nftService.saveCollectionForLater({
      name: body.name,
      symbol: body.symbol,
      userId: req.user.sub,
      collectibles: body.collectibles.map((collectible) => ({
        name: collectible.name,
        description: collectible.description,
        numberOfEditions: collectible.numberOfEditions,
        properties: collectible.properties,
      })),
    });
  }

  @Post('/saved-nfts/:id/file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions()))
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload image for nft' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'The id of the nft', required: true, example: 1 })
  async uploadNftMediaFile(
    @Request() req,
    @Param() params: UploadNftMediaFileParams,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.nftService.uploadMediaFile(params.id, file);
  }

  @Get('nfts/:id/token-uri')
  @UseGuards(JwtAuthGuard)
  @ApiTags('nfts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate the token URI for an NFT' })
  @ApiParam({ name: 'id', description: 'The id of the nft', required: true, example: 1 })
  async getTokenURI(@Param() params: GetNftTokenURIParams) {
    return {
      tokenUri: await this.nftService.getTokenURI(params.id),
    };
  }
}
