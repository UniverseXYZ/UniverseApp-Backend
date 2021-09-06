import { HttpException, HttpStatus } from '@nestjs/common';

export class NftCollectionNotFoundException extends HttpException {
  constructor() {
    super({ error: 'NftCollectionNotFound', message: 'Nft Collection not found' }, HttpStatus.NOT_FOUND);
  }
}
