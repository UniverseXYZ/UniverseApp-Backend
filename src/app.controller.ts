import { Controller, Get, Post, Request, Session, UseGuards } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AuthService } from './modules/auth/auth.service';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { SignedChallengeAuthGuard } from './modules/auth/signed-challenge-auth.guard';
import { EthersService } from './modules/ethers/ethers.service';
import { NftScraperService } from './modules/nftScraper/nftScraper.service';


@Controller()
export class AppController {
    constructor(private readonly appService: AppService, private authService: AuthService, private ethersService: EthersService, private nftScraperService: NftScraperService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/auth/getChallenge')
  @ApiOperation({ summary: 'Returns a challenge for the user to sign' })
  async getChallenge(@Session() session: Record<string, any>) {
    return this.authService.setChallenge(session);
  }

  @UseGuards(SignedChallengeAuthGuard)
  @ApiOperation({ summary: 'Checks if the signatures mathches the challenge and address, if it does returns a JWT token' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      properties: {
        'address': {
          type: 'string'
        },
        'signature': {
          type: 'string'
        }
      }
    }
  })
  @Post('api/auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/auth/me')
  async me(@Request() req) {
    return this.authService.login(req.user);
  }


  //-------------------------------------------------
  //only for dev remove in prod

  @Get('util/triggerNftScraper')
  async triggerNftScraper(){
    this.nftScraperService.getNftsForUsers();
  }

  @Get('api/auth/devSignChallenge')
  async devSignChallenge(@Session() session: Record<string, any>) {
    const sig = await this.ethersService.signMessage(session.challenge);
    return sig;
  }

  //only for dev remove in prod
  //-------------------------------------------------

}
