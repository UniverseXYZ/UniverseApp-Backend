import { IsBoolean, IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { constants } from 'src/common/constants';

export class UserInfoDto {
  @IsString()
  @Matches(constants.REGEX_JS_INSENSITIVE, {
    message: constants.FORBIDDEN_CHARACTERS_ERROR,
  })
  @ApiProperty({
    example: 'John Doe',
    description: 'String value for profile display name',
    required: true,
  })
  displayName: string;

  @IsString()
  @Matches(constants.REGEX_JS_INSENSITIVE, {
    message: constants.FORBIDDEN_CHARACTERS_ERROR,
  })
  @ApiProperty({
    example: 'http://...',
    description: 'String value for universe page url',
    required: true,
  })
  universePageUrl: string;

  @IsString()
  @Matches(constants.REGEX_JS_INSENSITIVE, {
    message: constants.FORBIDDEN_CHARACTERS_ERROR,
  })
  @IsOptional()
  @ApiProperty({
    example: 'Something about me',
    description: 'String value for profile description',
    required: false,
  })
  about: string;

  @IsString()
  @Matches(constants.REGEX_JS_INSENSITIVE, {
    message: constants.FORBIDDEN_CHARACTERS_ERROR,
  })
  @IsOptional()
  @ApiProperty({
    example: 'Something about me',
    description: 'Xeenon profile description',
    required: false,
  })
  xeenonDescription: string;

  @IsString()
  @Matches(constants.REGEX_JS_INSENSITIVE, {
    message: constants.FORBIDDEN_CHARACTERS_ERROR,
  })
  @IsOptional()
  @ApiProperty({
    example: 'Something about me',
    description: 'Hadron profile description',
    required: false,
  })
  hadronDescription: string;

  @IsString()
  @Matches(constants.REGEX_JS_INSENSITIVE, {
    message: constants.FORBIDDEN_CHARACTERS_ERROR,
  })
  @IsOptional()
  @ApiProperty({
    example: '@johnDoe',
    description: 'String value instagram handle',
    required: false,
  })
  instagramUser: string;

  @IsString()
  @Matches(constants.REGEX_JS_INSENSITIVE, {
    message: constants.FORBIDDEN_CHARACTERS_ERROR,
  })
  @IsOptional()
  @ApiProperty({
    example: '@johnDoe',
    description: 'String value twitter handle',
    required: false,
  })
  twitterUser: string;
}
