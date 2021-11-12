import { HttpException, HttpStatus } from '@nestjs/common';

export class RewardTierSlotsMinimumBidException extends HttpException {
  constructor() {
    super(
      { error: 'RewardTierSlotsMinimumBidException', message: 'Reward Tiers slots minimumBid field error !' },
      HttpStatus.NOT_FOUND,
    );
  }
}
