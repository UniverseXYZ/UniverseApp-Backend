import { Module } from '@nestjs/common';
import { AppConfigModule } from '../configuration/configuration.module';
import { MessageService } from './message.service';

/**
 * Message module is for sending out messages (email, sms, push, whatever...).
 */
@Module({
  imports: [
    AppConfigModule,
  ],
  providers: [
    MessageService,
  ],
  exports: [
    MessageService,
  ],
  controllers: [
    
  ],
})

export class MessageModule {}