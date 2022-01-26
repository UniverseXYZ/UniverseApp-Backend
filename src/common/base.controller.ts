import {
  HttpException,
  HttpStatus,
  Logger,
  HttpService,
} from '@nestjs/common';
import { constants } from './constants';
import { UniverseException } from './exceptions/UniverseException';
  
  
/**
 * Base Controller class.
 */
export class BaseController {
  
  protected logger;
  protected config;
  private httpService = new HttpService();
  
  constructor(
    name: string,
    config
  ) {
    this.logger = new Logger(name);
    this.config = config;
  }
  
  /**
   * Returns successful API response.
   * @param {any} body 
   * @returns {Object}
   */
  protected successResponse(body) {
    return body;
  }
  
  /**
   * Returns error API response.
   * If the error is an instance of UniverseException, 
   * the message will be sent to the client.
   * @param e 
   * @param statusCode 
   * @throws {HttpException}
   */
  protected errorResponse(e: Error) {
      
    let message = constants.GENERIC_ERROR;
    if(e instanceof UniverseException) {
      message = e.message;
    }
      
    // @TODO maybe return the actual error message on dev environment.
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }

  /**
   * Validates the captcha solution in request body.
   * Returns true only if the captcha is correct.
   * In all other cases throws an UniverseException.
   * @param {Object} requestBody 
   * @returns {Promise<boolean>}
   * @throws {UniverseException}
   */
  protected async verifyCaptcha(requestBody: any): Promise<boolean> {
    let value = false;   
    if(requestBody.hasOwnProperty(constants.CAPTCHA_RESPONSE) && requestBody[constants.CAPTCHA_RESPONSE].length) {
      let googleResponse = await this.httpService.post(`https://www.google.com/recaptcha/api/siteverify?secret=${this.config.values.google.captchaSecretKey}&response=${requestBody[constants.CAPTCHA_RESPONSE]}`)
        .toPromise();
      if(googleResponse.data.hasOwnProperty('success') && googleResponse.data.success) {
        value = true;
      } else {
         this.logger.error('Captcha has not been solved. Google response: ', JSON.stringify(googleResponse.data));
      }
    }
  
    if(!value) {
      throw new UniverseException('Anti spam protection has not been passed.');
    }
  
    return value;
  }
}