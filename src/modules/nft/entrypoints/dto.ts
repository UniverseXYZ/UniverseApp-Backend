import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { NftSource } from '../domain/nft.entity';

export class EditCollectionBody {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The name of the collection',
    example: 'Amazing NFTs',
    required: false,
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The new description of the collection',
    example: 'New description text',
    required: false,
  })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'https://site.io',
    description: 'The site of the collection',
    required: false,
  })
  siteLink?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'universe.xyz',
    description: 'The discord link of the collection',
    required: false,
  })
  discordLink?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'universeXYZ',
    description: 'Instagram profile of the collection',
    required: false,
  })
  instagramLink?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'universeXYZ',
    description: 'The medium profile of the collection',
    required: false,
  })
  mediumLink?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'universeXYZ',
    description: 'The telegram profile of the collection',
    required: false,
  })
  telegramLink?: string;
}

export class SaveNftBody {
  @IsString()
  @Length(1, 32)
  @ApiProperty({
    example: 'Single NFT name',
    description: 'The name of the NFT',
    required: true,
  })
  name: string;

  @IsString()
  @IsOptional()
  @Length(1, 1024)
  @ApiProperty({
    example: 'Single NFT description',
    description: 'The description of the NFT',
    required: false,
  })
  description?: string;

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'The number of NFT editions',
    required: true,
  })
  numberOfEditions: number;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    example: [{ attribute1: 'value' }, { attribute2: 'value' }],
    description: 'Additional NFT attributes',
    required: false,
  })
  properties?: any;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => SaveNftRoyalty)
  @ApiProperty({
    example: [{ address: '0x0000000000000000000000000', amount: 100 }],
    description: 'The royalty splits',
    required: false,
    type: () => [SaveNftRoyalty],
  })
  royalties?: SaveNftRoyalty[];

  @IsNumber()
  @ApiProperty({
    example: 10,
    description: 'The id of the collection',
    required: false,
  })
  collectionId: number;
}

export class SaveNftRoyalty {
  @IsString()
  address: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  amount: number;
}

export class SaveCollectionBody {
  @IsString()
  @Length(1, 32)
  @ApiProperty({
    example: 'Collection name',
    description: 'The name of the collection',
    required: true,
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'XYZ',
    description: 'The name of the collection',
    required: true,
  })
  symbol: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @Type(() => SaveNftBody)
  @ApiProperty({ type: () => [SaveNftBody] })
  collectibles: SaveNftBody[];
}

export class UploadNftMediaFileParams {
  @IsNumberString()
  id: number;
}

export class PatchSavedNftParams {
  @IsNumberString()
  id: number;
}

export class PatchMintingNftParams {
  @IsNumberString()
  id: number;
}

export class GetNftTokenURIParams {
  @IsNumberString()
  id: number;
}

export class EditSavedNftBody {
  @IsString()
  @IsOptional()
  @Length(1, 32)
  @ApiProperty({
    example: 'Single NFT name',
    description: 'The name of the NFT',
    required: false,
  })
  name: string;

  @IsString()
  @IsOptional()
  @Length(1, 1024)
  @ApiProperty({
    example: 'Single NFT description',
    description: 'The description of the NFT',
    required: false,
  })
  description?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 1,
    description: 'The number of NFT editions',
    required: false,
  })
  numberOfEditions: number;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    example: [{ attribute1: 'value' }, { attribute2: 'value' }],
    description: 'Additional NFT attributes',
    required: false,
  })
  properties?: any;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => SaveNftRoyalty)
  @ApiProperty({
    example: [{ address: '0x0000000000000000000000000', amount: 100 }],
    description: 'The royalty splits',
    required: false,
    type: () => [SaveNftRoyalty],
  })
  royalties?: SaveNftRoyalty[];

  @IsString()
  @IsOptional()
  @Length(1, 100)
  @ApiProperty({
    example: '0x0000000000000000000000000000000000000000000000000000000000000000',
    description: 'The transaction hash associated with the minting of the Saved NFT',
    required: false,
  })
  txHash: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 10,
    description: 'The id of the collection',
    required: false,
  })
  collectionId?: number;
}

export class GetNftTokenUriBody {
  @IsString()
  @Length(1, 32)
  @ApiProperty({
    example: 'Single NFT name',
    description: 'The name of the NFT',
    required: true,
  })
  name: string;

  @IsString()
  @IsOptional()
  @Length(1, 1024)
  @ApiProperty({
    example: 'Single NFT description',
    description: 'The description of the NFT',
    required: false,
  })
  description?: string;

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'The number of NFT editions',
    required: true,
  })
  @Transform(({ value }) => value && parseInt(value))
  numberOfEditions: number;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    example: [{ attribute1: 'value' }, { attribute2: 'value' }],
    description: 'Additional NFT attributes',
    required: false,
  })
  @Transform(({ value }) => value && JSON.parse(value))
  properties?: [{ [key: string]: string }];

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => SaveNftRoyalty)
  @ApiProperty({
    example: [{ address: '0x0000000000000000000000000', amount: 100 }],
    description: 'The royalty splits',
    required: false,
    type: () => [SaveNftRoyalty],
  })
  @Transform(({ value }) => value && JSON.parse(value))
  royalties?: SaveNftRoyalty[];

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'The collection id',
    required: true,
  })
  @Transform(({ value }) => value && parseInt(value))
  collectionId: number;
}

export class GetMyNftsResponse {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: NftSource, example: [NftSource.UNIVERSE, NftSource.SCRAPER] })
  source: string;

  @ApiProperty({ example: '0x0000000000000000000000000000000000000000000000000000000000000000' })
  txHash: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  tokenId: string;

  @ApiProperty({ example: ['jpeg', 'png', 'gif', 'webp', 'mp4'] })
  artworkType: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  optimized_url: string;

  @ApiProperty()
  thumbnail_url: string;

  @ApiProperty()
  original_url: string;

  @ApiProperty()
  tokenUri: string;

  @ApiProperty({ type: JSON })
  properties: any;

  @ApiProperty({ example: 10 })
  royalties: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class GetUserNftsResponse {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: NftSource, example: [NftSource.UNIVERSE, NftSource.SCRAPER] })
  source: string;

  @ApiProperty({ example: '0x0000000000000000000000000000000000000000000000000000000000000000' })
  txHash: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  tokenId: string;

  @ApiProperty({ example: ['jpeg', 'png', 'gif', 'webp', 'mp4'] })
  artworkType: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  optimized_url: string;

  @ApiProperty()
  thumbnail_url: string;

  @ApiProperty()
  original_url: string;

  @ApiProperty()
  tokenUri: string;

  @ApiProperty({ type: JSON })
  properties: any;

  @ApiProperty({ example: 10 })
  royalties: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
export class CreateCollectionBody {
  @IsString()
  @Length(1, 32)
  @ApiProperty({
    example: 'Name',
    description: 'The name of the collection',
    required: true,
  })
  name: string;

  @IsString()
  @Length(1, 10)
  @ApiProperty({
    example: 'SYM',
    description: 'The symbol of the collection',
    required: true,
  })
  symbol: string;

  @IsString()
  @IsOptional()
  @Length(1, 1024)
  @ApiProperty({
    example: 'Collection description',
    description: 'The description of the collection',
    required: false,
  })
  description?: string;

  @IsString()
  @IsOptional()
  @Length(1, 1024)
  @ApiProperty({
    example: 'https://site.io',
    description: 'The site of the collection',
    required: false,
  })
  siteLink?: string;

  @IsString()
  @IsOptional()
  @Length(1, 1024)
  @ApiProperty({
    example: 'universe.xyz',
    description: 'The discord link of the collection',
    required: false,
  })
  discordLink?: string;

  @IsString()
  @IsOptional()
  @Length(1, 1024)
  @ApiProperty({
    example: 'universeXYZ',
    description: 'Instagram profile of the collection',
    required: false,
  })
  instagramLink?: string;

  @IsString()
  @IsOptional()
  @Length(1, 1024)
  @ApiProperty({
    example: 'universeXYZ',
    description: 'The medium profile of the collection',
    required: false,
  })
  mediumLink?: string;

  @IsString()
  @IsOptional()
  @Length(1, 1024)
  @ApiProperty({
    example: 'universeXYZ',
    description: 'The telegram profile of the collection',
    required: false,
  })
  telegramLink?: string;
}

export class EditMintingCollectionParams {
  @IsString()
  @ApiProperty({
    example: '1',
    description: 'The id of the minting collection',
    required: true,
  })
  id: number;
}

export class EditCollectionParams {
  @IsString()
  @ApiProperty({
    example: '0x1cbb182322aee8ce9f4f1f98d7460173ee30af1f',
    description: 'The contract address of the collection',
    required: true,
  })
  address: string;
}

export class GetUserNftsParams {
  @IsString()
  @ApiProperty({
    example: 'username1',
    description: 'The username of the user',
    required: true,
  })
  username: string;
}

export class GetUserNftsQueryParams {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The offset for getting nfts',
    example: '8',
  })
  offset: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The amount of editions to get',
    example: '1',
  })
  limit: number;

  @IsOptional()
  @ApiProperty({
    description: 'The collection ids to filter by',
    example: '12,3',
  })
  collections: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'NFT name',
  })
  name: string;
}

export class GetSavedNftsParams {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The offset for getting nfts',
    example: '8',
  })
  offset: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The amount of editions to get',
    example: '1',
  })
  limit: number;
}

export class GetMyNftsParams {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The offset for getting nfts',
    example: '8',
  })
  offset: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The amount of editions to get',
    example: '1',
  })
  limit: number;
}

export class EditMintingCollectionBody {
  @IsString()
  @IsOptional()
  @Length(1, 1024)
  @ApiProperty({
    example: '0x0000000000000000000000002',
    description: 'The transaction hash of the minting collection',
    required: false,
  })
  txHash?: string;
}

export class DeleteSavedNftParams {
  @IsNumberString()
  @ApiProperty({
    description: 'The id of the Saved NFT to be deleted',
    example: 1,
  })
  id: number;
}

export class GetCollectionParams {
  @IsString()
  @ApiProperty({
    description: 'The address of the Collection',
    example: '0x0000000000000000000000000',
  })
  address: string;
}

export class EditMintingNftBody {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  @ApiProperty({
    example: '0x0000000000000000000000000000000000000000000000000000000000000000',
    description: 'The transaction hash associated with the Minting NFT',
    required: false,
  })
  txHash: string;

  @IsInt()
  @ApiProperty({
    example: 10,
    description: 'Number of actual editions minted',
    required: false,
  })
  numberOfEditions: number;
}

export class GetNftParams {
  @IsString()
  @ApiProperty({
    description: 'The address of the Collection',
    example: '0x0000000000000000000000000',
  })
  collectionAddress: string;
  @IsNumberString()
  @ApiProperty({
    description: 'The token id of the NFT',
    example: '1',
  })
  tokenId: number;
}

export class GetMyCollectionsPendingParams {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The offset for getting nfts',
    example: '8',
  })
  offset: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The amount of editions to get',
    example: '1',
  })
  limit: number;
}

export class GetMyNftsPendingParams {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The offset for getting nfts',
    example: '8',
  })
  offset: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The amount of editions to get',
    example: '1',
  })
  limit: number;
}
export class GetMyNftsAvailabilityParams {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The offset for getting nfts',
    example: '8',
  })
  start: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The amount of editions to get',
    example: '1',
  })
  limit: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The minimum required editions of a nft',
    example: '3',
  })
  size: number;
}

export class GetMyCollectionsParams {
  @IsString()
  @ApiProperty({
    description: 'Whether the endpoint should return my collections or my collections + core collections',
    example: 'true',
  })
  mintable: string;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The offset for getting nfts',
    example: '8',
  })
  offset: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The amount of editions to get',
    example: '1',
  })
  limit: number;
}

export class GetMyCollectionsTabParams {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The offset for getting nfts',
    example: '8',
  })
  offset: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The amount of editions to get',
    example: '1',
  })
  limit: number;
}

export class GetCollectionQueryParams {
  @IsString()
  @IsOptional()
  @Length(1, 32)
  @ApiProperty({
    example: 'Single NFT name',
    description: 'The name of the NFT',
  })
  name: string;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The offset for getting nfts',
    example: '8',
  })
  offset: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The amount of editions to get',
    example: '1',
  })
  limit: number;
}

export class GetMyNftsPageParams {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The offset for getting nfts',
    example: '8',
  })
  offset: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The amount of editions to get',
    example: '1',
  })
  limit: number;

  @IsOptional()
  @ApiProperty({
    description: 'The collection ids to filter by',
    example: '12,3',
  })
  collections: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'NFT name',
  })
  name: string;
}
