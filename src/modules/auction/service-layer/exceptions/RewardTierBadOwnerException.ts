import { HttpException, HttpStatus } from '@nestjs/common';

export class RewardTierBadOwnerException extends HttpException {
  constructor() {
    super(
      { error: 'RewardTierBadOwnerException', message: 'User is not the owner of the reward tier' },
      HttpStatus.CONFLICT,
    );
  }
}
