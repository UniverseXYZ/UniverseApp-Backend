import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @IsString()
  @ApiProperty({
    example: 'John Doe',
    description: 'String value for profile display name',
    required: true,
  })
  displayName: string;

  @IsString()
  @ApiProperty({
    example: 'http://...',
    description: 'String value for universe page url',
    required: true,
  })
  universePageUrl: string;

  @IsString()
  @ApiProperty({
    example: 'Something about me',
    description: 'String value for profile description',
    required: true,
  })
  about: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '@johnDoe',
    description: 'String value instagram handle',
    required: true,
  })
  instagramUser: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '@johnDoe',
    description: 'String value twitter handle',
    required: true,
  })
  twitterUser: string;
}