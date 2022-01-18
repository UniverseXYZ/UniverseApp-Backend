import { Controller, Post, Get, Request, Body } from '@nestjs/common';
import { MoralisService } from './moralis.service';

@Controller('api/webhooks/moralis')
export class MoralisWebHookController {
  constructor(private moralisService: MoralisService) {}

  @Post('add')
  async handleNewNFTOwner(@Request() req, @Body() body) {
    const token = body.object;
    await this.moralisService.addNewNFT(token);
    return true;
  }
}
