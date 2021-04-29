import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { SignedChallengeStrategy } from './signed-challenge.strategy';

import { UsersModule } from '../users/users.module';
import { EthersModule } from '../ethers/ethers.module';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    EthersModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  providers: [AuthService, JwtStrategy, SignedChallengeStrategy],
  exports: [AuthService],
})
export class AuthModule {}