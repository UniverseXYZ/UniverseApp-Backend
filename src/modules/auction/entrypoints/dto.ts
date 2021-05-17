import { IsInt, IsNumber, IsString, Max } from 'class-validator';

export class CreateRewardTierBody {
  @IsString()
  name: string;

  @IsNumber()
  @Max(20)
  numberOfWinners: number;

  @IsNumber()
  @Max(5)
  nftsPerWinner: number;

  @IsInt({ each: true })
  nftIds: number[];
}
