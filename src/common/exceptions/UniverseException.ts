import { 
  HttpException, 
  HttpStatus,
} from '@nestjs/common';

/**
 * UniverseException class.
 * Always use this exception if you want the message to be sent to the client.
 */
export class UniverseException extends HttpException {
  constructor(message = 'Bad Request') {
    super({
      status: HttpStatus.BAD_REQUEST,
      error: 'Universe Exception', 
      message: message, 
    }, HttpStatus.BAD_REQUEST);
  }
}