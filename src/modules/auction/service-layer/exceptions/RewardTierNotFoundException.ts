import { HttpException, HttpStatus } from '@nestjs/common';

export class RewardTierNotFoundException extends HttpException {
  constructor() {
    super({ error: 'RewardTierNotFoundException', message: 'Reward tier not found' }, HttpStatus.NOT_FOUND);
  }
}
