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
import { RiderService } from 'src/modules/app/rider/rider.service';

@Injectable()
@Processor(AppConfig.QUEUE.NAME.MAIL)
export class MailProcessor {
  constructor(
    private readonly mailService: MailService,
    private readonly authService: AuthService,
    private readonly vendorService: VendorService,
    private readonly riderService: RiderService,
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
  async createBusinessMerchantForVendor(job: Job) {
    const { user, vendor, dto } = job.data;
    try {
      this.vendorService._createBusinessMerchantForVendor(user, vendor, dto);
    } catch (error) {
      console.error('Error creating in Vendor merchant and business:', error);
    }
  }

  // @Process(AppConfig.QUEUE.JOBS.VENDOR_RIDER_APPROVAL)
  // async createBusinessMerchantForRider(job: Job) {
  //   const { user, rider, dto } = job.data;
  //   try {
  //     this.riderService._createBusinessMerchantForRider(user, rider, dto);
  //   } catch (error) {
  //     console.error('Error creating in rider merchant and business:', error);
  //   }
  // }
}
