import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginBody, SetChallengeBody, SetChallengeResponse } from './entrypoints/dto';

@Controller('api/auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('setChallenge')
  @ApiOperation({ summary: 'Set a challenge for the user to sign in' })
  @ApiResponse({ type: SetChallengeResponse, status: 200 })
  async setChallenge(@Body() body: SetChallengeBody) {
    return await this.authService.setChallenge(body.challenge);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  @ApiOperation({
    summary: 'Checks if the signatures mathches the challenge and address, if it does returns a JWT token',
  })
  async login(@Request() req, @Body() body: LoginBody) {
    return this.authService.login(body.address, body.uuid, body.signature);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    return this.authService.getMe(req.user.sub);
  }
}
