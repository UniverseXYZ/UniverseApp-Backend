import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidChallengeException extends HttpException {
  constructor() {
    super(
      {
        error: 'InvalidChallengeException',
        message: 'The challenge is not valid',
      },
      HttpStatus.CONFLICT,
    );
  }
}
