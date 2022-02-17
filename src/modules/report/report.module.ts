import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { MessageModule } from '../message/message.module';
import { Report } from './domain/report.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { AppConfigModule } from '../configuration/configuration.module';

/**
 * The Report module contains the logic related to violating content reported by users.
 * The "report" name however might be changed as we may want to create statistics 
 * and analysis "reports". 
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
    ]),
    UsersModule,
    MessageModule,
    AppConfigModule,
  ],
  providers: [
    ReportService
  ],
  exports: [],
  controllers: [
    ReportController
  ],
})

export class ReportModule {}