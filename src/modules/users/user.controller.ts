import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('api/user')
export class UserController {
  constructor(
    private usersService: UsersService,
  ) { }

  @Post('/upload-profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
    const ret = await this.usersService.uploadProfileImage(file);
    return ret;
  }
}
