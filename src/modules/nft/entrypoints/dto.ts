import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveSingleNftDto {
  @IsString()
  @ApiProperty({
    example: 'Single NFT name',
    description: 'The name of the NFT',
    required: true,
  })
  name: string;

  @IsString()
  @IsOptional()
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

  @IsObject()
  @IsOptional()
  @ApiProperty({
    example: { attribute1: 'value' },
    description: 'Additional NFT attributes',
    required: false,
  })
  properties?: any;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 10,
    description: 'The royalties percentage',
    required: false,
  })
  royalties?: number;
}
