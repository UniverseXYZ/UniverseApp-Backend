import { HttpException, HttpStatus } from '@nestjs/common';

export class NftCollectionBadOwnerException extends HttpException {
  constructor() {
    super({ error: 'NftCollectionBadOwner', message: 'Unauthorised edit of collection' }, HttpStatus.CONFLICT);
  }
}
