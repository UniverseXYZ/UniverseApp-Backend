import { HttpException, HttpStatus } from '@nestjs/common';

export class NftNoAssetException extends HttpException {
  constructor() {
    super({ error: 'NftNoAssetException', message: 'Can\'t mint token without a file' }, HttpStatus.NOT_FOUND);
  }
}
