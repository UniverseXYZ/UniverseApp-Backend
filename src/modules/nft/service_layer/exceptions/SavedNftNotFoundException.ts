import { HttpException, HttpStatus } from '@nestjs/common';

export class SavedNftNotFoundException extends HttpException {
  constructor() {
    super({ error: 'SavedNftNotFoundException', message: 'Saved nft not found' }, HttpStatus.NOT_FOUND);
  }
}
