import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import configuration from './modules/configuration';
import { DatabaseModule } from './modules/database/database.module';
import { TypeOrmDefaultConfigService } from './modules/database/database.providers';
import { EthersModule } from './modules/ethers/ethers.module';
import { HealthModule } from './modules/health/health.module';
import { NftScraperModule } from './modules/nftScraper/nftScraper.model';
import { QueueModule } from './modules/queue/queue.model';
import { UsersModule } from './modules/users/users.module';
import { NftModule } from './modules/nft/nft.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    EthersModule,
    QueueModule,
    NftScraperModule
    NftModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
