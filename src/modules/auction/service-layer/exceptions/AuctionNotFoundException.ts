import { HttpException, HttpStatus } from '@nestjs/common';

export class AuctionNotFoundException extends HttpException {
  constructor() {
    super({ error: 'AuctionNotFoundException', message: 'Auction not found' }, HttpStatus.NOT_FOUND);
  }
}
