import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateAuctionLinkException extends HttpException {
  constructor() {
    super(
      { error: 'DuplicateAuctionLinkException', message: `An auction with this link already exists!` },
      HttpStatus.CONFLICT,
    );
  }
}
