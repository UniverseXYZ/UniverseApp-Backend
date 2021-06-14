import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EthersService } from '../ethers/ethers.service';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private ethersService: EthersService,
  ) {}

  async validateUser(address: string, message: string, signature: string): Promise<any> {
    const signerAddress = await this.ethersService.verifySignature(message, signature);

    if (address.toLowerCase() !== signerAddress.toLowerCase()) return false;
    return await this.usersService.findOne(address);
  }

  async login(userId: number) {
    const user = await this.usersService.getById(userId);
    const payload = { address: user.address, sub: user.id };

    return new LoginDto(this.jwtService.sign(payload), user)
  }

  async getMe(userId: number) {
    return await this.usersService.getById(userId);
  }

  async setChallenge(session: Record<string, any>) {
    const challenge = uuidv4();
    const sig = await this.ethersService.signMessage(challenge);
    session.challenge = challenge;
    return challenge;
  }
}

export class LoginDto {
  token: string;
  user: User;

  constructor(token: string, user: User) {
    this.token = token;
    this.user = user;
  }
}
