import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from '../configuration/configuration.service';
import { MessageService } from '../message/message.service';
import { UsersService } from '../users/users.service';
import { Report } from './domain/report.entity';
import { CreateReportDto } from './dto';

@Injectable()
export class ReportService {
  private logger = new Logger(this.constructor.name);

  constructor(
    private usersService: UsersService,
    private messageService: MessageService,
    private config: AppConfig,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  /**
   * Creates a report in the report table from data sent by UI.
   * Returns created report id.
   * @param userId
   * @param body
   * @returns {Object} {id: <new report id>}
   */
  public async createReport(userId: number, body: CreateReportDto) {
    const user = await this.usersService.getById(userId);

    let newReport = await this.reportRepository.create({
      userId: user.id,
      userAddress: user.address,
      collectionAddress: body.collectionAddress,
      tokenId: body.tokenId,
      description: body.description,
      reason: body.reason,
    });
    newReport = await this.reportRepository.save(newReport);

    //send email notification
    if (newReport.id) {
      await this.messageService.createMessage(
        'reportNotification',
        'Reported violating content',
        [this.config.values.report.violationsEmail],
        {
          userId: newReport.userId,
          userAddress: newReport.userAddress,
          collectionAddress: newReport.collectionAddress,
          tokenId: newReport.tokenId,
          description: newReport.description,
        },
      );
    }

    return {
      id: newReport.id,
    };
  }
}
