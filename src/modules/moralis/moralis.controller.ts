import { Controller, Post, Get, Request, Body } from '@nestjs/common';
import { MoralisService } from './moralis.service';

@Controller('api/moralis')
export class MoralisController {
  constructor(private moralisService: MoralisService) {}

  @Post('retry')
  async retry() {
    this.moralisService.retryAll();
  }
}
