import { Body, Controller, Get, Post, Request, Session, UseGuards } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AuthService } from './modules/auth/auth.service';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { SignedChallengeAuthGuard } from './modules/auth/signed-challenge-auth.guard';
import { EthersService } from './modules/ethers/ethers.service';
import { NftScraperService } from './modules/nftScraper/nftScraper.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private ethersService: EthersService,
    private nftScraperService: NftScraperService,
  ) {}

  //-------------------------------------------------
  //only for dev remove in prod

  @Get('util/triggerNftScraper')
  async triggerNftScraper() {
    this.nftScraperService.getNftsForUsers();
  }

  @Get('api/auth/devSignChallenge')
  async devSignChallenge(@Body() body) {
    const sig = await this.ethersService.signMessage(body.challenge);
    return sig;
  }

  //only for dev remove in prod
  //-------------------------------------------------
}
