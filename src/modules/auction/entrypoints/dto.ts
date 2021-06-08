import { IsArray, IsBoolean, isBoolean, IsDateString, IsInt, IsNumber, IsNumberString, IsObject, IsOptional, isString, IsString, Max, ValidateNested } from 'class-validator';
import { isOptionalChain } from 'typescript';

class RewardTierBodyParams {
  name: string;
  numberOfWinners: number;
  minimumBid: number;
  nftsPerWinner: number;
  nftIds: number[];
}
export class CreateRewardTierBody{
  @IsNumber()
  auctionId: number;

  @IsString()
  name: string;

  @IsNumber()
  numberOfWinners: number;

  @IsNumber()
  tierPosition: number;

  @IsNumber()
  minimumBid: number;

  @IsNumber()
  nftsPerWinner: number;

  @IsNumber({},{each: true})
  nftIds: number[];
}

export class UpdateRewardTierBody{
  @IsNumber()
  tierId: number;

  @IsString()
  name: string;

  @IsNumber()
  numberOfWinners: number;

  @IsNumber()
  minimumBid: number;

  @IsNumber()
  nftsPerWinner: number;

  @IsNumber({},{each: true})
  nftIds: number[];
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

export class CreateAuctionBody extends AuctionBody { }

export class UpdateAuctionBodyParams {

}
export class UpdateAuctionBody {
  @IsNumber()
  auctionId: number;

  @IsString()
  @IsOptional()
  name: string;

  @IsDateString()
  @IsOptional()
  startDate: Date;

  @IsDateString()
  @IsOptional()
  endDate: Date;

  @IsString()
  @IsOptional()
  bidCurrency: string;

  @IsNumber()
  @IsOptional()
  startingBid: number;
}

export class UpdateAuctionExtraBodyParams {
  headline: string;
  link: string;
  backgroundBlur: boolean;
}

export class UpdateAuctionExtraBody {
  @IsNumber()
  auctionId: number;

  @IsString()
  @IsOptional()
  headline: string;

  @IsString()
  @IsOptional()
  link: string;

  @IsBoolean()
  @IsOptional()
  backgroundBlur: boolean;
}