import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { UserController } from './user.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from '../multer/multer.service';
import { AppConfigModule } from '../configuration/configuration.module';

@Module({
  imports: [
    AppConfigModule,
    FileStorageModule,
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UserController],
})
export class UsersModule {}
