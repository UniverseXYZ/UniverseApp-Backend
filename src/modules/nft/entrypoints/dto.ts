import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
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
    description: 'The new description of the collection',
    example: 'New description text',
    required: false,
  })
  description?: string;
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

  @ApiProperty({ enum: NftSource, examples: [NftSource.UNIVERSE, NftSource.SCRAPER] })
  source: string;

  @ApiProperty({ example: '0x0000000000000000000000000000000000000000000000000000000000000000' })
  txHash: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  tokenId: string;

  @ApiProperty({ examples: ['jpeg', 'png', 'gif', 'webp', 'mp4'], example: 'jpeg' })
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

  @ApiProperty({ enum: NftSource, examples: [NftSource.UNIVERSE, NftSource.SCRAPER] })
  source: string;

  @ApiProperty({ example: '0x0000000000000000000000000000000000000000000000000000000000000000' })
  txHash: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  tokenId: string;

  @ApiProperty({ examples: ['jpeg', 'png', 'gif', 'webp', 'mp4'], example: 'jpeg' })
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
    example: '1',
    description: 'The id of the collection',
    required: true,
  })
  id: number;
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

export class GetMyCollectionsParams {
  @IsString()
  @ApiProperty({
    description: 'Whether the endpoint should return my collections or my collections + core collections',
    example: 'true',
  })
  mintable: string;
}
