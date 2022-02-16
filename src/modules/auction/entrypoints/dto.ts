import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsInt,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class NftSlots {
  nftIds: number[];
  slot: number;
  minimumBid: number;
}
export class UpdateRewardTierParams {
  @IsNumberString()
  id: string;
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
    description: 'The description of the reward tier',
    example: 'This is an amazing reward tier',
  })
  @IsString()
  @Length(0, 600)
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The tint color of the reward tier in hex format',
    example: '#456373',
  })
  @IsString()
  @Length(0, 20)
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'Number of winners for the tier',
    example: 3,
  })
  @IsNumber()
  @IsOptional()
  numberOfWinners: number;

  @ApiProperty({
    description: 'The range of allocated nfts per winner',
    example: '1-3',
  })
  @IsString()
  @IsOptional()
  nftsPerWinner: string;

  @ApiProperty({
    description: 'The nft slot configuration',
    example: [
      { nftIds: [1, 4], slot: 1, minimumBid: 0.1 },
      { nftIds: [2, 5], slot: 2, minimumBid: 0.2 },
      { nftIds: [3, 6], slot: 3, minimumBid: 0.3 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsOptional()
  nftSlots: NftSlots[];
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

  @ApiProperty({
    description: `The auction's id from the smart contract`,
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  onChainId: number;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  @ApiProperty({ description: 'The hash of the createAuction transaction', example: `0x0000000000` })
  createAuctionTxHash: string;
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
    description: 'The range of allocated nfts per winner',
    example: '1-3',
  })
  @IsString()
  nftsPerWinner: string;

  @ApiProperty({
    description: 'The nft slot configuration',
    example: [
      { nftIds: [1, 4], slot: 1, minimumBid: 0.1 },
      { nftIds: [2, 5], slot: 2, minimumBid: 0.2 },
      { nftIds: [3, 6], slot: 3, minimumBid: 0.3 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  nftSlots: NftSlots[];
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
    example: '1-3',
  })
  nftsPerWinner: string;

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

export class GetMyAuctionsQuery {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    example: 10,
    description: 'The number of returned auction items ',
    type: 'number',
    required: false,
  })
  limit: string;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    example: 10,
    description: 'The number of auction items to be skipped',
    type: 'number',
    required: false,
  })
  offset: string;
}

export class GetMyAuctionsPaginationResponse {
  @ApiProperty({
    example: 10,
    description: 'The number of returned auction items ',
  })
  limit: number;

  @ApiProperty({
    example: 0,
    description: 'The number of auction items to be skipped',
  })
  offset: number;

  @ApiProperty({
    example: 10,
    description: 'The total number of auctions',
  })
  total: number;
}

export class AuctionResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  headline: string;

  @ApiProperty()
  tokenAddress: string;

  @ApiProperty()
  tokenSymbol: string;

  @ApiProperty()
  tokenDecimals: number;

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;

  @ApiProperty()
  link: string;

  @ApiProperty()
  promoImageUrl: string;

  @ApiProperty()
  backgroundImageUrl: string;

  @ApiProperty({ type: 'boolean', example: false })
  backgroundImageBlur: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ isArray: true, type: () => RewardTierResponse })
  rewardTiers: RewardTierResponse[];
}

export class RewardTierResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  auctionId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  numberOfWinners: number;

  @ApiProperty()
  nftsPerWinner: string;

  @ApiProperty()
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

export class GetMyAuctionsResponse {
  @ApiProperty({
    type: GetMyAuctionsPaginationResponse,
  })
  pagination: GetMyAuctionsPaginationResponse;

  @ApiProperty({
    type: AuctionResponse,
    isArray: true,
  })
  auctions: AuctionResponse[];
}

export class GetAuctionPageParams {
  @ApiProperty({
    example: 'username1',
    description: 'The username of the artist',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'auctionName1',
    description: 'The unique name of the auction',
  })
  @IsString()
  auctionName: string;
}


export class GetUserBidsParams {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    example: 8,
    description: 'The number of returned auction items ',
    type: 'number',
    required: false,
  })
  limit: string;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    example: 0,
    description: 'The number of auction items to be skipped',
    type: 'number',
    required: false,
  })
  offset: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'universe',
    description: 'Searching by auction or artist name',
    type: 'string',
    required: false,
  })
  search: string;
}

export class DeleteImageParams {
  @ApiProperty({
    example: 1,
    description: 'The id of the auction or reward tier that should have its image deleted',
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    example: 'tier',
    description: 'Type of image to delete (auction background/promo image or reward tier image)',
  })
  @IsString()
  type: string;
}

export class ValidateUrlParams {
  @ApiProperty({
    example: 1,
    description: 'The id of the auction to which the user is bidding',
  })
  @IsNumberString()
  @IsOptional()
  auctionId: number;
}


export class AddRewardTierBodyParams {
  @ApiProperty({
    description: 'The id of the Auction on which the tier should be added',
    example: '1',
  })
  @IsInt()
  auctionId: number;

  @ApiProperty({
    type: CreateRewardTierBody,
  })
  @Type(() => CreateRewardTierBody)
  rewardTier: CreateRewardTierBody;
}

export class GetAuctionsQuery {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    example: 8,
    description: 'The number of returned auction items ',
    type: 'number',
    required: false,
  })
  limit: string;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    example: 0,
    description: 'The number of auction items to be skipped',
    type: 'number',
    required: false,
  })
  offset: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '0x65D31741878da0520d1Ae6db298A9BD994Q5D241',
    description: 'User address',
    type: 'string',
    required: false,
  })
  address: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'ending',
    description: 'The filter in which the actions should be ordered by',
    type: 'string',
    required: false,
  })
  filters: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'universe',
    description: 'Searching by auction or artist name',
    type: 'string',
    required: false,
  })
  search: string;
}
