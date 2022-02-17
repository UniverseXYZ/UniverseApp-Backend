import {
  Injectable,
  Logger,
} from '@nestjs/common';
import * as ejs from 'ejs';
import { AppConfig } from '../configuration/configuration.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MessageService {

  private logger = new Logger(this.constructor.name);

  constructor(
    private config: AppConfig,
  ) {

  }

  /**
   * Creates a message and sends it with the selected delivery method (options.type).
   * @param templateName 
   * @param subject 
   * @param recipients 
   * @param parameters 
   * @param options 
   */
  public async createMessage(templateName: string, subject: string, recipients: any, parameters: {}, options = {})  {
    recipients = Array.isArray(recipients) ? recipients : [recipients];

    const message = {
      template: templateName,
      parameters: parameters,
      subject: subject,
    };

    let messageAudience = [];

    // recipients can be phone numbers or user ids or other type of identifiers.
    // for now it will support only email addresses.
    for(let recipient of recipients) {
      messageAudience.push(recipient);
    }

    await this.sendMessage(message, messageAudience, options);
  }

  /**
   * Sends out the message depending on the delivery method.
   * @param message 
   * @param messageAudience 
   * @param options 
   */
  private async sendMessage(message, messageAudience, options) {

    // @TODO dump the message to the DB and pass id to the sending method to update the status.

    // for now we only support sending message via email, however this service can de added logic
    // to send sms or push notifications or whatever.
    // @TODO move types to common constants when it's finally merged from the PR #188!
    if(!options.hasOwnProperty('type') || !options.type || 'email' === options.type) {
      await this.sendEmailMessage(message, messageAudience);
    }
  }

  /**
   * Sends out email message.
   * @param message 
   * @param messageAudience - array of email addresses.
   * @returns void
   */
  private async sendEmailMessage(message, messageAudience: string[]) {
    try {
      messageAudience = [...new Set(messageAudience)];
      const messageBody = await ejs.renderFile(
        __dirname + '/../../../templates/email/' + message.template + '.ejs',
        message.parameters
      );

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465, //587,
        secure: true, // true for 465, false for other ports
        auth: {
          user: this.config.values.google.senderEmail,
          pass: this.config.values.google.senderEmailPassword,
        },
      });

      // sending emails individually and asynchronously
      for(const recipient of messageAudience) {
        const sendAsync = () => {
          return new Promise((resolve, reject) => {
            transporter.sendMail({
              from: `"Universe" <${this.config.values.google.senderEmail}>`,
              to: recipient,
              subject: message.subject,
              html: messageBody, // html body
            }).then((sendMailResponse) => {         
              if(!sendMailResponse.messageId) {
                this.logger.error(`Error sending an email message! ${JSON.stringify(sendMailResponse)} ${JSON.stringify(message)} ${JSON.stringify(messageAudience)}`);
                // @TODO add status to the DB?
                reject();
              } else {
                // @TODO add status to the DB?
                resolve(true);
              }
            }).catch((e) => {
              // @TODO add status to the DB?
              this.logger.error(`Error sending an email message! ${JSON.stringify(message)} ${JSON.stringify(messageAudience)}`);
              this.logger.error(e);
            });
            
          });
        }
        sendAsync();
      }

    } catch(e) {
      this.logger.error('Could not send emails to recipients: ' + JSON.stringify(messageAudience));
      this.logger.error(e);
    }
  }
}