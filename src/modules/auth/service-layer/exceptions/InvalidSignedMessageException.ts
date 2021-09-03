import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidSignedMessageException extends HttpException {
  constructor() {
    super(
      {
        error: 'InvalidSignedMessageException',
        message: 'The signed message is invalid',
      },
      HttpStatus.CONFLICT,
    );
  }
}
