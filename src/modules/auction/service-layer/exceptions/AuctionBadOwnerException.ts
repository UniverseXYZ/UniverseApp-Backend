import { HttpException, HttpStatus } from '@nestjs/common';

export class AuctionBadOwnerException extends HttpException {
  constructor() {
    super({ error: 'AuctionBadOwnerException', message: 'User is not the owner of the auction' }, HttpStatus.CONFLICT);
  }
}
