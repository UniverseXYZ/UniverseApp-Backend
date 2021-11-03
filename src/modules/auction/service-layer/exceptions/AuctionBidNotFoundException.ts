import { HttpException, HttpStatus } from '@nestjs/common';

export class AuctionBidNotFoundException extends HttpException {
  constructor() {
    super({ error: 'AuctionBidNotFoundException', message: 'Auction bid not found' }, HttpStatus.NOT_FOUND);
  }
}
