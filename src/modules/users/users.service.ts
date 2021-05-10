import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { config } from 'node:process';
import { Repository } from 'typeorm';
import { AppConfig } from '../configuration/configuration.service';
import { S3Service } from '../s3/s3.service';
import { User } from './user.entity';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private s3Service: S3Service,
    private readonly config: AppConfig,
  ) {
  }

  async findOne(address: string): Promise<User | undefined> {
    let user = await this.usersRepository.findOne({ where: { address } });
    if (!user) {
      user = new User();
      user.address = address;
      user.isActive = true;
      await this.usersRepository.save(user);
    }

    return user;
  }

  async uploadProfileImage(file: Express.Multer.File) {
    try {
      await this.s3Service.uploadDocument(`${file.path}`, `${this.config.values.aws.pathPrefix}/profileImage/${file.filename}`)
    } catch(e) {
      return false;
    }
    return true;
  }
}