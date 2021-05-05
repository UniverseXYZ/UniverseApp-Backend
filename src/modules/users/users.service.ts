import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>) {
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
}