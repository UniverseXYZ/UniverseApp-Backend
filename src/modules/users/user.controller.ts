import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserInfoDto } from './user.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('api')
export class UserController {
  constructor(private usersService: UsersService) {}

  @Post('user/upload-profile-image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadProfileImage(@UploadedFile() file: Express.Multer.File, @Request() req) {
    const ret = await this.usersService.uploadProfileImage(file, req.user);
    return ret;
  }

  @Post('user/upload-logo-image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadLogoImage(@UploadedFile() file: Express.Multer.File, @Request() req) {
    const ret = await this.usersService.uploadLogoImage(file, req.user);
    return ret;
  }

  @Post('user/save-profile-info')
  @UseGuards(JwtAuthGuard)
  async saveProfileInfo(@Request() req, @Body() userInfoDto: UserInfoDto) {
    const ret = await this.usersService.saveProfileInfo(userInfoDto, req.user);
    return ret;
  }

  @Get('user/get-profile-info/:address')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get profile info for address' })
  async getProfileInfo(@Param('address') address: string) {
    const info = await this.usersService.getProfileInfo(address);
    return info;
  }

  @Get('/pages/user-profile/:username')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get profile page for username' })
  async getPublicInfo(@Param('username') username: string) {
    return await this.usersService.getByUsername(username);
  }

  @Get('user/validate/name/:name')
  async validateName(@Param('name') name) {
    return await this.usersService.validateName(name);
  }

  @Get('user/validate/url/:url')
  async validateUrl(@Param('url') url) {
    return await this.usersService.validateUrl(url);
  }
}
