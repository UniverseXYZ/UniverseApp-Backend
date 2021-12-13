import { HttpException, HttpStatus } from '@nestjs/common';

export class RewardTierNFTUsedInOtherTierException extends HttpException {
  constructor() {
    super(
      { error: 'RewardTierNFTUsedInOtherTierException', message: 'This NFT is being used in other reward Tier !' },
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}
