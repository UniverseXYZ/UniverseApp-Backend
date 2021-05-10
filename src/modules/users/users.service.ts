import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { config } from 'node:process';
import { Repository } from 'typeorm';
import { AppConfig } from '../configuration/configuration.service';
import { S3Service } from '../s3/s3.service';
import { UserInfoDto } from './user.dto';
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

  async saveProfileInfo (userInfoDto : UserInfoDto, user: any){
    const userDb = await this.usersRepository.findOne({where : {address: user.address}});
    if (!userDb) return false;

    userDb.displayName = userInfoDto.displayName;
    userDb.universePageUrl = userInfoDto.universePageUrl;
    userDb.about = userInfoDto.about;
    userDb.instagramUser = userInfoDto.instagramUser;
    userDb.twitterUser = userInfoDto.twitterUser;

    await this.usersRepository.save(userDb);
  }

  async uploadProfileImage(file: Express.Multer.File, user: any) {
    try {
      await this.s3Service.uploadDocument(`${file.path}`, `${this.config.values.aws.pathPrefix}/profileImage/${file.filename}`);
      const userDb = await this.usersRepository.findOne({where : {address: user.address}});
      if (!userDb) return false;

      userDb.profileImageName = file.filename;
      await this.usersRepository.save(userDb);
    } catch(e) {
      return false;
    }
    return true;
  }

  async uploadLogoImage(file: Express.Multer.File, user: any) {
    try {
      await this.s3Service.uploadDocument(`${file.path}`, `${this.config.values.aws.pathPrefix}/logoImage/${file.filename}`);
      const userDb = await this.usersRepository.findOne({where : {address: user.address}});
      if (!userDb) return false;

      userDb.logoImageName = file.filename;
      await this.usersRepository.save(userDb);
    } catch(e) {
      return false;
    }
    return true;
  }

  async getProfileInfo (address: string){
    return await this.usersRepository.findOne({where : {address: address, isActive: true}});
  }
}