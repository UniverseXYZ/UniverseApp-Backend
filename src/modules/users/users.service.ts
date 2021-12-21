import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { AppConfig } from '../configuration/configuration.service';
import { S3Service } from '../file-storage/s3.service';
import { UserInfoDto } from './user.dto';
import { User } from './user.entity';
import { UserNotFoundException } from './service-layer/exceptions/UserNotFoundException';
import { DuplicateUniversePageUrlException } from './service-layer/exceptions/DuplicateUniversePageUrlException';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private s3Service: S3Service,
    private readonly config: AppConfig,
  ) {}

  async findOne(address: string) {
    let user = await this.usersRepository.findOne({ where: { address } });

    if (!user) {
      user = new User();
      user.address = address.toLowerCase();
      user.isActive = true;
      await this.usersRepository.save(user);
    }

    return user;
  }

  async saveProfileInfo(userInfoDto: UserInfoDto, user: any) {
    const [userDb, duplicateUrlUser] = await Promise.all([
      this.usersRepository.findOne({ where: { address: user.address } }),
      this.usersRepository.findOne({
        where: { universePageUrl: userInfoDto.universePageUrl, address: Not(user.address) },
      }),
    ]);

    if (!userDb) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error: User not found',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (duplicateUrlUser) {
      throw new DuplicateUniversePageUrlException();
    }

    userDb.displayName = userInfoDto.displayName;
    userDb.universePageUrl = userInfoDto.universePageUrl;
    userDb.about = userInfoDto.about;
    userDb.instagramUser = userInfoDto.instagramUser;
    userDb.twitterUser = userInfoDto.twitterUser;

    await this.usersRepository.save(userDb);
  }
  async uploadProfileImage(file: Express.Multer.File, user: any) {
    try {
      const userDb = await this.usersRepository.findOne({ where: { address: user.address } });
      if (!userDb) {
        throw new Error('User not found');
      }

      const result = await this.s3Service.uploadDocument(`${file.path}`, `profiles/${file.filename}`);

      userDb.profileImageName = result.key;
      await this.usersRepository.save(userDb);

      return {
        profileImageUrl: `${this.config.values.aws.s3BaseUrl}/${userDb.profileImageName}`,
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: e.toString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadLogoImage(file: Express.Multer.File, user: any) {
    try {
      const userDb = await this.usersRepository.findOne({ where: { address: user.address } });
      if (!userDb) {
        throw new Error('User not found');
      }

      const result = await this.s3Service.uploadDocument(`${file.path}`, `logos/${file.filename}`);
      userDb.logoImageName = result.key;
      await this.usersRepository.save(userDb);

      return {
        logoImageUrl: `${this.config.values.aws.s3BaseUrl}/${userDb.logoImageName}`,
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: e.toString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProfileInfo(address: string) {
    return await this.usersRepository.findOne({ where: { address: address, isActive: true } });
  }

  async getByUsername(username: string) {
    const user = await this.usersRepository.findOne({ where: { universePageUrl: username, isActive: true } });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async getById(id: number, validate = true) {
    const user = await this.usersRepository.findOne({ where: { id, isActive: true } });

    if (!user && validate) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async validateName(name: string) {
    if (await this.usersRepository.findOne({ where: { displayName: name } })) {
      return false;
    }

    return true;
  }

  async validateUrl(url: string) {
    if (await this.usersRepository.findOne({ where: { universePageUrl: url } })) {
      return false;
    }

    return true;
  }
}
