import { HttpException, HttpStatus } from '@nestjs/common';

export class MintingCollectionBadOwnerException extends HttpException {
  constructor() {
    super(
      { error: 'MintingCollectionBadOwnerException', message: 'Minting Collection is owned by other user' },
      HttpStatus.NOT_FOUND,
    );
  }
}
