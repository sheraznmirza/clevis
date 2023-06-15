import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import AppConfig from 'src/configs/app.config';
import { MailService } from 'src/modules/mail/mail.service';
import { AuthService } from 'src/modules/app/auth/auth.service';
import { UserType } from '@prisma/client';

@Injectable()
@Processor(AppConfig.QUEUE.NAME.MAIL)
export class MailProcessor {
  constructor(
    private readonly mailService: MailService,
    private readonly authService: AuthService,
  ) {}

  @Process(AppConfig.QUEUE.JOBS.SEND_VERIFICATION_EMAIL)
  async sendEmail(job: Job) {
    const { user, userType } = job.data;
    try {
      this.mailService.verificationEmail(user, userType);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  @Process(AppConfig.QUEUE.JOBS.CREATE_CUSTOMER_TAP_AND_MAIL)
  async createTapCustomerAndEmail(job: Job) {
    const { user, response } = job.data;
    try {
      this.authService._createTapCustomerAndMail(
        response,
        user,
        UserType.CUSTOMER,
      );
    } catch (error) {
      console.error('Error creating TAP Customer and Email:', error);
    }
  }
}
