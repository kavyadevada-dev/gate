import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
/**
 * MailModule is a feature module that encapsulates the email sending functionality.
 * It provides the MailService for sending emails and can be imported into other modules.
 */
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}