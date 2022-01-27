import { Controller, Post, Query, Headers } from '@nestjs/common';
import { MoralisService } from './moralis.service';
import { UnauthorizedException } from '@nestjs/common';
import { GetMoralisHistoryQuery } from './dto';
import { AppConfig } from '../configuration/configuration.service';

const getOneHourAgoTimeStamp = (timeStamp: number): number => {
  const date = new Date(timeStamp);
  date.setTime(date.getTime() - 60 * 60 * 1000);
  return date.getTime();
};

@Controller('api/moralis')
export class MoralisController {
  constructor(private moralisService: MoralisService, private readonly config: AppConfig) {}

  @Post('retry')
  async retry(@Headers('Authorization') authKey: string) {
    if (!authKey || authKey != this.config.values.auth.apiSecret) {
      throw new UnauthorizedException();
    }

    this.moralisService.retryAll();
  }

  @Post('history')
  async history(@Query() query: GetMoralisHistoryQuery, @Headers('Authorization') authKey: string) {
    if (!authKey || authKey != this.config.values.auth.apiSecret) {
      throw new UnauthorizedException();
    }

    const end = query.end ? query.end : Date.now();
    const start = query.start ? query.start : getOneHourAgoTimeStamp(end);
    if (start >= end) {
      console.log(`Start date must be earlier than end date`);
    }
    console.log(`Fetch moralis NFTs that are created from ${new Date(Number(start))} to ${new Date(end)}`);
    this.moralisService.getHistory(start, end);
  }
}
