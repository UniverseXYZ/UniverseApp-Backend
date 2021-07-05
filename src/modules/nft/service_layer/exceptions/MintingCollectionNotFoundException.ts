import { HttpException, HttpStatus } from '@nestjs/common';

export class MintingCollectionNotFoundException extends HttpException {
  constructor() {
    super({ error: 'MintingCollectionNotFound', message: 'Minting Collection Not Found' }, HttpStatus.NOT_FOUND);
  }
}
