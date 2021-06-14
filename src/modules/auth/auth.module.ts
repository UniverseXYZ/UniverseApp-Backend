import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { SignedChallengeStrategy } from './signed-challenge.strategy';

import { UsersModule } from '../users/users.module';
import { EthersModule } from '../ethers/ethers.module';
import { AppConfigModule } from '../configuration/configuration.module';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { configValues } from '../configuration';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    EthersModule,
    AppConfigModule,
    JwtModule.register({
      secret: configValues.auth.jwtSecret,
      signOptions: { expiresIn: '360d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, SignedChallengeStrategy],
  exports: [AuthService],
})
export class AuthModule {}
