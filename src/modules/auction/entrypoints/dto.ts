import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString, IsNotEmpty,
  IsNumber, IsNumberString,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class RewardTierBodyParams {
  name: string;
  numberOfWinners: number;
  minimumBid: number;
  nftsPerWinner: number;
  nftIds: number[];
}

export class UpdateRewardTierParams {
  @IsNumberString()
  id: number;
}

export class UpdateRewardTierBody {
  @ApiProperty({
    description: 'The name of reward tier',
    example: 'Reward tier 1',
  })
  @IsString()
  @Length(1, 100)
  @IsOptional()
  name: string;

  @ApiProperty({
    description: 'Number of winners for the tier',
    example: 3,
  })
  @IsNumber()
  @IsOptional()
  numberOfWinners: number;

  @ApiProperty({
    description: 'The number of allocated nfts per winner',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  nftsPerWinner: number;

  @ApiProperty({
    description: 'The minimum bid associated with the reward tier',
    example: 0.1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  minimumBid: number;

  @ApiProperty({
    description: 'The nft ids of the reward tier',
    example: [1, 2, 3],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @IsOptional()
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

export class CreateAuctionBody {
  @ApiProperty({
    description: 'The name of the auction',
    example: 'Auction1',
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({
    description: 'Starting bid of the auction',
    example: 0.1,
  })
  @IsNumber()
  startingBid: number;

  @ApiProperty({
    description: 'Address of the bidding token',
    example: '0x0000000000000000000000000000000',
  })
  @IsString()
  tokenAddress: string;

  @ApiProperty({
    description: 'Symbol of the bidding token',
    example: 'XYZ',
  })
  @IsString()
  tokenSymbol: string;

  @ApiProperty({
    description: 'Number of decimals of the bidding token',
    example: 18,
  })
  @IsNumber()
  tokenDecimals: number;

  @ApiProperty({
    description: 'Start date of the auction in ISO format',
    example: '2021-07-20T09:02:31.168Z',
  })
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    description: 'End date of the auction in ISO format',
    example: '2021-07-20T09:02:31.168Z',
  })
  @IsDateString()
  endDate: Date;

  @IsArray()
  @ArrayMinSize(1)
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAuctionRoyaltySplitBody)
  @ApiProperty({ type: () => CreateAuctionRoyaltySplitBody, isArray: true })
  royaltySplits: CreateAuctionRoyaltySplitBody[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateRewardTierBody)
  @ApiProperty({ type: () => CreateRewardTierBody, isArray: true })
  rewardTiers: CreateRewardTierBody[];
}

export class EditAuctionParams {
  @IsNumberString()
  id: number;
}

export class UploaductionLandingImagesParams {
  @IsNumberString()
  id: number;
}

export class EditAuctionBody {
  @ApiProperty({
    description: 'The name of the auction',
    example: 'Auction1',
  })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  name: string;

  @ApiProperty({
    description: 'Starting bid of the auction',
    example: 0.1,
  })
  @IsNumber()
  @IsOptional()
  startingBid: number;

  @ApiProperty({
    description: 'Address of the bidding token',
    example: '0x0000000000000000000000000000000',
  })
  @IsString()
  @IsOptional()
  tokenAddress: string;

  @ApiProperty({
    description: 'Symbol of the bidding token',
    example: 'XYZ',
  })
  @IsNotEmpty({ always: true })
  @IsOptional()
  @IsString()
  tokenSymbol: string;

  @ApiProperty({
    description: 'Number of decimals of the bidding token',
    example: 18,
  })
  @IsOptional()
  @IsNumber()
  tokenDecimals: number;

  @ApiProperty({
    description: 'Start date of the auction in ISO format',
    example: '2021-07-20T09:02:31.168Z',
  })
  @IsOptional()
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    description: 'End date of the auction in ISO format',
    example: '2021-07-20T09:02:31.168Z',
  })
  @IsOptional()
  @IsDateString()
  endDate: Date;

  @IsArray()
  @ArrayMinSize(1)
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAuctionRoyaltySplitBody)
  @ApiProperty({ type: () => CreateAuctionRoyaltySplitBody, isArray: true })
  royaltySplits: CreateAuctionRoyaltySplitBody[];

  @IsString()
  @IsOptional()
  @Length(1, 255)
  @ApiProperty({ description: 'The headline of the auction', example: `Auction's headline` })
  headline: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  @ApiProperty({ description: 'The custom link of the auction', example: `auction1` })
  link: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: 'Sete background image blur', example: false })
  backgroundImageBlur: boolean;
}

export class CreateRewardTierBody {
  @ApiProperty({
    description: 'The name of reward tier',
    example: 'Reward tier 1',
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({
    description: 'Number of winners for the tier',
    example: 3,
  })
  @IsNumber()
  numberOfWinners: number;

  @ApiProperty({
    description: 'The number of allocated nfts per winner',
    example: 1,
  })
  @IsNumber()
  nftsPerWinner: number;

  @ApiProperty({
    description: 'The minimum bid associated with the reward tier',
    example: 0.1,
    required: false,
  })
  @IsNumber()
  minimumBid: number;

  @ApiProperty({
    description: 'The nft ids of the reward tier',
    example: [1, 2, 3],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  nftIds: number[];
}

export class CreateAuctionRoyaltySplitBody {
  @ApiProperty({
    description: 'Ethereum address',
    example: '0x0000000000000000000000000000',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Percentage of split royalty',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentAmount: number;
}

export class UpdateAuctionBodyParams {}

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

  @IsString()
  @IsOptional()
  txHash: string;
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

export class EditRewardTierResponse {
  @ApiProperty({
    example: 1,
  })
  id: number;

  @ApiProperty({
    example: 'Reward tier name',
  })
  name: string;

  @ApiProperty({
    example: 1,
  })
  numberOfWinners: number;

  @ApiProperty({
    example: 1,
  })
  nftsPerWinner: number;

  @ApiProperty({
    example: "0.1",
  })
  minimumBid: string;

  @ApiProperty({
    example: 1,
  })
  tierPosition: number;

  @ApiProperty()
  customDescription: string;

  @ApiProperty()
  tierImageUrl: string;

  @ApiProperty()
  tierColor: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
