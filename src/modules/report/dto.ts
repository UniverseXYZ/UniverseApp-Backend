import { IsInt, IsNotEmpty, IsNumberString, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { constants } from '../../common/constants';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  @Matches(constants.REGEX_ETHEREUM_ADDRESS, {
    message: constants.INVALID_ETHEREUM_ADDRESS_ERROR,
  })
  @ApiProperty({
    description: 'Collection address',
    type: 'string',
    example: '0xaaaaaaaaaabbbbbbbbbbcccccccccc9999999999',
    required: true,
  })
  collectionAddress: string;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    description: 'Token id',
    type: 'number string',
    example: '83755632',
    required: false,
  })
  tokenId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  @ApiProperty({
    description: 'Claim description. Max length 4096',
    type: 'string',
    example: 'Stole my content!',
    required: true,
  })
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  @ApiProperty({
    description: 'Report reason. Max length 4096',
    type: 'string',
    example: 'Explicit context',
    required: true,
  })
  reason: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Captcha response',
    type: 'string',
    example: '',
    required: true,
  })
  [constants.CAPTCHA_RESPONSE]: string;
}
