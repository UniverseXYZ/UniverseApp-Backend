import { IsDateString, IsInt, IsNumber, IsString, Max } from 'class-validator';

export class CreateRewardTierBody {
  @IsString()
  name: string;

  @IsNumber()
  @Max(20)
  numberOfWinners: number;

  @IsNumber()
  @Max(5)
  nftsPerWinner: number;

  @IsInt({ each: true })
  nftIds: number[];
}

export class CreateAuctionBody {
  @IsString()
  name: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsString()
  bidCurrency: string;

  @IsNumber()
  startingBid: number;
}
