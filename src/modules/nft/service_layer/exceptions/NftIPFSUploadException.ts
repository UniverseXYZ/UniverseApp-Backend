import { HttpException, HttpStatus } from '@nestjs/common';

export class NftIPFSUploadException extends HttpException {
  constructor() {
    super({
      error: 'NftIPFSUploadException', 
      message: 'Could not upload to IPFS',
    }, HttpStatus.NOT_FOUND);
  }
}
