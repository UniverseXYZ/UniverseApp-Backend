import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateUniversePageUrlException extends HttpException {
  constructor() {
    super(
      { error: 'DuplicateUniversePageUrl', message: 'User with the same universe page url already exists' },
      HttpStatus.NOT_FOUND,
    );
  }
}
