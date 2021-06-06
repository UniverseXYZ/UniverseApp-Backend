import { IsDateString, IsInt, IsNumber, isString, IsString, Max } from 'class-validator';

class RewardTierBody {
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
export class CreateRewardTierBody extends RewardTierBody {
  @IsNumber()
  auctionId: number;
}

export class UpdateRewardTierBody extends RewardTierBody {
  @IsNumber()
  tierId: number;
}

export class UpdateRewardTierExtraBody {
  @IsNumber()
  tierId: number;

  @IsString()
  customDescription: string;

  @IsString()
  tierColor: string;
}
export class AuctionBody {
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

export class CreateAuctionBody extends AuctionBody {}

export class UpdateAuctionBody extends AuctionBody {
  @IsNumber()
  auctionId: number;
}

export class UpdateAuctionExtraBody {
  @IsNumber()
  auctionId: number;

  @IsString()
  headline: string;

  @IsString()
  link: string;

  @IsString()
  backgroundBlur: boolean;
}