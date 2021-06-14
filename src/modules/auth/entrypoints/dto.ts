import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginBody {
  @IsString()
  @ApiProperty({
    example: '0x0000',
    description: 'The wallet public address',
    required: true,
  })
  address: string;

  @IsString()
  @ApiProperty({
    example: '0x0000',
    description: 'The signed challenge',
    required: true,
  })
  signature: string;
}
