import { HttpException, HttpStatus } from '@nestjs/common';

export class AuctionCannotBeModifiedException extends HttpException {
  constructor() {
    super(
      { error: 'AuctionCannotBeModifiedException', message: 'Auction cannot be modified !' },
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}
