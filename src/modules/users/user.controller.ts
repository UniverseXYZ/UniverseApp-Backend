import { Body, Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { S3Service } from '../s3/s3.service';
import * as fs from 'fs';

@Controller('api/user')
export class UserController {
  constructor(
    private usersService: UsersService,
    private s3Service: S3Service
  ) { }

  @Get('/upload-profile-image')
  async uploadProfileImage() {
    fs.writeFileSync('./test.txt', 'test');
    const ret = await this.s3Service.uploadDocument('./test.txt', 'logos/test.txt')
    return ret;
  }
}
