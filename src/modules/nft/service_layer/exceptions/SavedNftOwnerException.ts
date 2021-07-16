import { HttpException, HttpStatus } from '@nestjs/common';

export class SavedNftOwnerException extends HttpException {
  constructor() {
    super({ error: 'SavedNftOwnerException', message: `The user doesn't own the Saved NFT` }, HttpStatus.CONFLICT);
  }
}
