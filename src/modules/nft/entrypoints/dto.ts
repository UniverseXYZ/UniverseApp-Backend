import {
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

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @ApiProperty({
    example: 10,
    description: 'The royalties percentage',
    required: false,
  })
  royalties?: number;
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

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @ApiProperty({
    example: 10,
    description: 'The royalties percentage',
    required: false,
  })
  royalties?: number;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  @ApiProperty({
    example: '0x0000000000000000000000000000000000000000000000000000000000000000',
    description: 'The transaction hash associated with the minting of the Saved NFT',
    required: false,
  })
  txHash: string;
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
  properties?: any;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @ApiProperty({
    example: 10,
    description: 'The royalties percentage',
    required: false,
  })
  @Transform(({ value }) => value && parseInt(value))
  royalties?: number;
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
