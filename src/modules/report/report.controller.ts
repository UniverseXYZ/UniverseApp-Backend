import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto';
import { BaseController } from '../../common/base.controller';
import { AppConfig } from '../configuration/configuration.service';

@Controller('api/report')
@ApiTags('report')
export class ReportController extends BaseController {
  constructor(private reportService: ReportService, protected config: AppConfig) {
    super(ReportController.name, config);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit report about violating content.',
  })
  async createReport(@Req() req, @Body() body: CreateReportDto) {
    try {
      await this.verifyCaptcha(body);
      return await this.reportService.createReport(req.user.sub, body);
    } catch (e) {
      this.logger.error(e);
      this.errorResponse(e);
    }
  }
}
