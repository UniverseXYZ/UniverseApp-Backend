import { HttpException, HttpStatus } from '@nestjs/common';

export class RewardTierSlotsOrderException extends HttpException {
  constructor() {
    super(
      { error: 'RewardTierSlotsOrderException', message: 'Reward Tiers slots order error !' },
      HttpStatus.NOT_FOUND,
    );
  }
}
