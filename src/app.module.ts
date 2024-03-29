import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './modules/configuration';
import { DatabaseModule } from './modules/database/database.module';
import { TypeOrmDefaultConfigService } from './modules/database/database.providers';
import { EthersModule } from './modules/ethers/ethers.module';
import { HealthModule } from './modules/health/health.module';
import { QueueModel } from './modules/queue/queue.model';
import { UsersModule } from './modules/users/users.module';
import { NftModule } from './modules/nft/nft.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuctionModule } from './modules/auction/auction.module';
import { EthEventsScraperModule } from './modules/ethEventsScraper/ethEventsScraper.model';
import { MoralisModule } from './modules/moralis/moralis.module';
import { ReportModule } from './modules/report/report.module';
import { AppConfig } from './modules/configuration/configuration.service';

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
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.KD_REDIS_PASSWORD,
      },
    }),
    HealthModule,
    UsersModule,
    EthersModule,
    QueueModel,
    NftModule,
    AuthModule,
    AuctionModule,
    EthEventsScraperModule,
    MoralisModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppConfig],
})
export class AppModule {}
