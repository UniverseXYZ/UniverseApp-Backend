import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { S3Module } from '../s3/s3.module';
import { UserController } from './user.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from '../multer/multer.service';
import { AppConfigModule } from '../configuration/configuration.module';

@Module({
  imports: [AppConfigModule, S3Module, MulterModule.registerAsync({
    useClass: MulterConfigService,
  }), TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UserController]
})
export class UsersModule { }