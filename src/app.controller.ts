import { Controller, Get, Post, Request, Session, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './modules/auth/auth.service';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { SignedChallengeAuthGuard } from './modules/auth/signed-challenge-auth.guard';
import { EthersService } from './modules/ethers/ethers.service';


@Controller()
export class AppController {
    constructor(private readonly appService: AppService, private authService: AuthService, private ethersService: EthersService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/auth/getChallenge')
  async getChallenge(@Session() session: Record<string, any>) {
    return this.authService.setChallenge(session);
  }

  @UseGuards(SignedChallengeAuthGuard)
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
  @Get('api/auth/devSignChallenge')
  async devSignChallenge(@Session() session: Record<string, any>) {
    const sig = await this.ethersService.signMessage(session.challenge);
    return sig;
  }
  //only for dev remove in prod
  //-------------------------------------------------

}
