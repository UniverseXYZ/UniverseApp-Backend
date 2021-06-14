import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Request,
  Session,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignedChallengeAuthGuard } from './signed-challenge-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginBody } from './entrypoints/dto';

@Controller('api/auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('getChallenge')
  @ApiOperation({ summary: 'Returns a challenge for the user to sign' })
  async getChallenge(@Session() session: Record<string, any>) {
    return this.authService.setChallenge(session);
  }

  @UseGuards(SignedChallengeAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  @ApiOperation({
    summary: 'Checks if the signatures mathches the challenge and address, if it does returns a JWT token',
  })
  async login(@Request() req, @Body() body: LoginBody) {
    return this.authService.login(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    return this.authService.getMe(req.user.sub);
  }
}
