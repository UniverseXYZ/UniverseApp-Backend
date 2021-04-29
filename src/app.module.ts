import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import configuration from './modules/configuration';
import { DatabaseModule } from './modules/database/database.module';
import { TypeOrmDefaultConfigService } from './modules/database/database.providers';
import { EthersModule } from './modules/ethers/ethers.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false,
      ignoreEnvVars: false,
      isGlobal: true,
      expandVariables: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [DatabaseModule],
      useExisting: TypeOrmDefaultConfigService,
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    EthersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
