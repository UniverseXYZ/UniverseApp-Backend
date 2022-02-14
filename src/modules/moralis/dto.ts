import { IsNumber, IsNumberString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetMoralisHistoryQuery {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    example: 975754320637,
    description: 'The timestamp for the start date',
    type: 'number',
    required: false,
  })
  start: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({
    example: 975754320637,
    description: 'The timestamp for the end date',
    type: 'number',
    required: false,
  })
  end: number;
}
