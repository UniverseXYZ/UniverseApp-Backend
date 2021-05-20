import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EthersService } from '../ethers/ethers.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private ethersService: EthersService
  ) { }


  async validateUser(address: string, message:string, signature: string): Promise<any> {
    const signerAddress = await this.ethersService.verifySignature(message, signature);

    if (address.toLowerCase() !== signerAddress.toLowerCase()) return false;
    return await this.usersService.findOne(address);
  }

  async login(user: any) {
    const payload = { address: user.address, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user
    };
  }

  async setChallenge(session: Record<string, any>) {
    const challenge = uuidv4();
    const sig = await this.ethersService.signMessage(challenge);
    session.challenge = challenge;
    return challenge;
  }

}