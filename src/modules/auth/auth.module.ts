import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

import { UsersModule } from '../users/users.module';
import { EthersModule } from '../ethers/ethers.module';
import { AppConfigModule } from '../configuration/configuration.module';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { configValues } from '../configuration';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginChallenge } from './model/login-challenge.entity';

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
    TypeOrmModule.forFeature([LoginChallenge]),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
