import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import AppConfig from 'src/configs/app.config';
import { MailService } from 'src/modules/mail/mail.service';
import { AuthService } from 'src/modules/app/auth/auth.service';
import { UserType } from '@prisma/client';
import { VendorUpdateStatusDto } from 'src/modules/app/vendor/dto';
import { VendorService } from 'src/modules/app/vendor/vendor.service';

@Injectable()
@Processor(AppConfig.QUEUE.NAME.MAIL)
export class MailProcessor {
  constructor(
    private readonly mailService: MailService,
    private readonly authService: AuthService,
    private readonly vendorService: VendorService,
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

  @Process(AppConfig.QUEUE.JOBS.VENDOR_RIDER_APPROVAL)
  async createBusinessMerchantForVendorRider(job: Job) {
    const { user, vendor, dto } = job.data;
    try {
      this.vendorService._createBusinessMerchantForVendorRider(
        user,
        vendor,
        dto,
      );
    } catch (error) {
      console.error('Error creating merchant and business:', error);
    }
  }
}
