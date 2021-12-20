import { HttpException, HttpStatus } from '@nestjs/common';

export class ImageDeleteTypeException extends HttpException {
  constructor() {
    super({ error: 'ImageDeleteTypeException', message: 'Invalid image type provided' }, HttpStatus.CONFLICT);
  }
}
