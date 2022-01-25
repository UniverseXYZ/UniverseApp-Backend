import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EthersService } from '../ethers/ethers.service';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginChallenge } from './model/login-challenge.entity';
import { Repository } from 'typeorm';
import { InvalidChallengeException } from './service-layer/exceptions/InvalidChallengeException';
import { InvalidSignedMessageException } from './service-layer/exceptions/InvalidSignedMessageException';
import { MoralisService } from '../moralis/moralis.service';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private ethersService: EthersService,
    private moralisService: MoralisService,
    @InjectRepository(LoginChallenge)
    private loginChallengeRepository: Repository<LoginChallenge>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async validateUser(address: string, message: string, signature: string): Promise<any> {
    const signerAddress = await this.ethersService.verifySignature(message, signature);

    if (address.toLowerCase() !== signerAddress.toLowerCase()) return false;
    return await this.usersService.findOneOrCreate(address);
  }

  async login(address: string, challengeUUID: string, signature: string) {
    const challenge = await this.loginChallengeRepository.findOne({ where: { uuid: challengeUUID } });

    if (!challenge || challenge.uuid !== challengeUUID) {
      throw new InvalidChallengeException();
    }

    const signerAddress = await this.ethersService.verifySignature(challenge.challenge, signature);

    if (address.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new InvalidSignedMessageException();
    }

    await this.loginChallengeRepository.delete({ uuid: challengeUUID });
    const user = await this.usersService.findOneOrCreate(address);

    if (!user.moralisWatched) {
      try {
        await this.moralisService.addNewUserToWatchAddress(user.address);
        await this.usersRepository.update({ id: user.id }, { moralisWatched: true });
      } catch (error) {
        this.logger.error(error);
      }
    }
    const payload = { address: user.address, sub: user.id };

    return new LoginDto(this.jwtService.sign(payload), user);
  }

  async getMe(userId: number) {
    return await this.usersService.getById(userId);
  }

  async setChallenge(challenge: string) {
    const uuid = uuidv4();
    let loginChallenge = this.loginChallengeRepository.create({
      uuid,
      challenge,
    });
    loginChallenge = await this.loginChallengeRepository.save(loginChallenge);

    return {
      uuid: loginChallenge.uuid,
    };
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
