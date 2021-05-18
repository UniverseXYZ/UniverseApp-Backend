import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { SaveCollectionBody, SaveNftBody } from './dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { NftService } from '../service_layer/nft.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('api')
export class NftController {
  constructor(
    private nftService: NftService,
  ) {
  }
  @Post('/single-nfts/save')
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

  @Post('/collections/save')
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
}
