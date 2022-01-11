import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
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
import {
  NftSourceEnum, 
  MetadataStorageEnum 
} from '../../../common/constants/enums';
import { constants } from 'src/common/constants';

export class CreateNftBody {
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

  // @IsNumber()
  @IsNumberString()
  @ApiProperty({
    example: 1,
    description: 'The number of NFT editions',
    required: true,
  })
  numberOfEditions: number;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => NftProperty)
  @ApiProperty({
    example: [{ property: 'property1', value: 'value1', modifiable: '1' }, { property: 'property2', value: 'value2', modifiable: '0' }],
    description: 'Additional NFT attributes',
    required: false,
    type: () => [NftProperty],
  })
  properties?: NftProperty[];

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

  // @IsNumber()
  @IsNumberString()
  @ApiProperty({
    example: 10,
    description: 'The id of the collection',
    required: true,
  })
  collectionId: number;

  @IsEnum(MetadataStorageEnum)
  @ApiProperty({
    enum: MetadataStorageEnum, 
    example: [
      MetadataStorageEnum.ONCHAIN, 
      MetadataStorageEnum.OFFCHAIN
    ],
    required: true,
  })
  metadataStorage: MetadataStorageEnum;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'https://arweave.net/license',
    required: false,
  })
  licenseUri: string;
}

export class EditNftBody {
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

  // @IsNumber()
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    example: 1,
    description: 'The number of NFT editions',
    required: false,
  })
  numberOfEditions: number;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => NftProperty)
  @ApiProperty({
    example: [{ property: 'property1', value: 'value1', modifiable: '1' }, { property: 'property2', value: 'value2', modifiable: '0' }],
    description: 'Additional NFT attributes',
    required: false,
    type: () => [NftProperty],
  })
  properties?: NftProperty[];

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

  // @IsString()
  // @IsOptional()
  // @Length(1, 100)
  // @ApiProperty({
  //   example: '0x0000000000000000000000000000000000000000000000000000000000000000',
  //   description: 'The transaction hash associated with the minting of the Saved NFT',
  //   required: false,
  // })
  // txHash: string;

  // @IsNumber()
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    example: 10,
    description: 'The id of the collection',
    required: false,
  })
  collectionId?: number;

  @IsOptional()
  @IsEnum(MetadataStorageEnum)
  @ApiProperty({
    enum: MetadataStorageEnum, 
    example: [
      MetadataStorageEnum.ONCHAIN, 
      MetadataStorageEnum.OFFCHAIN
    ],
    required: true,
  })
  metadataStorage: MetadataStorageEnum;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'https://arweave.net/license',
    required: false,
  })
  licenseUri: string;
}

export class SaveNftRoyalty {
  @IsString()
  address: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  amount: number;
}

export class NftProperty {
  @IsString()
  property: string;

  @IsString()
  value: string;

  @IsNumberString()
  modifiable: string;
}

export class CreateCollectionBody {
  @IsString()
  @Length(1, 32)
  @ApiProperty({
    example: 'Collection name',
    description: 'The name of the collection',
    required: true,
  })
  name: string;

  @IsString()
  @Length(1, 7)
  @ApiProperty({
    example: 'XYZ',
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

  // @IsArray()
  // @ValidateNested({ each: true })
  // @ArrayMinSize(1)
  // @ArrayMaxSize(5)
  // @Type(() => CreateNftBody)
  // @ApiProperty({ type: () => [CreateNftBody] })
  // collectibles: CreateNftBody[];
}

export class UpdateCollectionBody {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The new description of the collection',
    example: 'New description text',
    required: false,
  })
  description?: string;
}

export class UploadNftMediaFileParams {
  @IsNumberString()
  id: number;
}

export class UploadNftMediaFileBody {
  @IsString()
  @IsOptional()
  @Length(1, 32)
  name: string;

  @IsString()
  @IsOptional()
  @Length(1, 1024)
  description: string;

  @Transform(({ value }) => value && parseInt(value))
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(constants.NFT_FILES_MAX_COUNT)
  order: number;
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

  @IsEnum(MetadataStorageEnum)
  @ApiProperty({
    enum: MetadataStorageEnum, 
    example: [
      MetadataStorageEnum.ONCHAIN, 
      MetadataStorageEnum.OFFCHAIN
    ],
    required: true,
  })
  metadataStorage: MetadataStorageEnum;
}

export class GetMyNftsResponse {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: NftSourceEnum, example: [NftSourceEnum.UNIVERSE, NftSourceEnum.SCRAPER] })
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

  @ApiProperty({ enum: NftSourceEnum, example: [NftSourceEnum.UNIVERSE, NftSourceEnum.SCRAPER] })
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
// export class CreateCollectionBody {
//   @IsString()
//   @Length(1, 32)
//   @ApiProperty({
//     example: 'Name',
//     description: 'The name of the collection',
//     required: true,
//   })
//   name: string;

//   @IsString()
//   @Length(1, 10)
//   @ApiProperty({
//     example: 'SYM',
//     description: 'The symbol of the collection',
//     required: true,
//   })
//   symbol: string;

//   @IsString()
//   @IsOptional()
//   @Length(1, 1024)
//   @ApiProperty({
//     example: 'Collection description',
//     description: 'The description of the collection',
//     required: false,
//   })
//   description?: string;
// }

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

export class DeleteNftParams {
  @IsNumberString()
  @ApiProperty({
    description: 'The id of the NFT to be deleted',
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

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'The id of the auction',
    example: '1',
  })
  auctionId: number;
}

export class GetMyCollectionsParams {
  @IsString()
  @ApiProperty({
    description: 'Whether the endpoint should return my collections or my collections + core collections',
    example: 'true',
  })
  deployable: string;
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
