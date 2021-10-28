import { Controller, Post, Query } from '@nestjs/common';
import { MoralisService } from './moralis.service';

const getOneHourAgoTimeStamp = (timeStamp: number): number => {
  const date = new Date(timeStamp);
  console.log(date);
  console.log(timeStamp);
  date.setTime(date.getTime() - 60 * 60 * 1000);
  return date.getTime();
};

@Controller('api/moralis')
export class MoralisController {
  constructor(private moralisService: MoralisService) {}

  @Post('retry')
  async retry() {
    this.moralisService.retryAll();
  }

  @Post('history')
  async history(@Query() query) {
    const end = query.end ? query.end : Date.now();
    const start = query.start ? query.start : getOneHourAgoTimeStamp(end);
    if (start >= end) {
      console.log(`Start date must be earlier than end date`);
    }
    console.log(`Fetch moralis NFTs that are created from ${new Date(start)} to ${new Date(end)}`);
    this.moralisService.getHistory(start, end);
  }
}
