import { HttpException, HttpStatus } from '@nestjs/common';

export class NftNotFoundException extends HttpException {
  constructor() {
    super({ error: 'NftNotFound', message: 'Nft not found' }, HttpStatus.NOT_FOUND);
  }
}
