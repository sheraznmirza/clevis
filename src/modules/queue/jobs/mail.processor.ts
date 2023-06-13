import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import AppConfig from 'src/configs/app.config';
import { MailService } from 'src/modules/mail/mail.service';

@Injectable()
@Processor(AppConfig.QUEUE.NAME.MAIL)
export class MailProcessor {
  constructor(private readonly mailService: MailService) {}

  @Process(AppConfig.QUEUE.JOBS.SEND_VERIFICATION_EMAIL)
  async sendEmail(job: Job) {
    const { user, userType } = job.data;
    try {
      this.mailService.verificationEmail(user, userType);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
