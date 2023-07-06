import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import AppConfig from 'src/configs/app.config';
import { MailService } from 'src/modules/mail/mail.service';
import { AuthService } from 'src/modules/app/auth/auth.service';
import { UserType } from '@prisma/client';
import { VendorService } from 'src/modules/app/vendor/vendor.service';
import { RiderService } from 'src/modules/app/rider/rider.service';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
@Processor(AppConfig.QUEUE.NAME.MAIL)
export class MailProcessor {
  constructor(
    private readonly mailService: MailService,
    private readonly authService: AuthService,
    private readonly vendorService: VendorService,
    private readonly riderService: RiderService,
    private readonly config: ConfigService,
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
    const { user, dto } = job.data;
    try {
      this.vendorService._createBusinessMerchantForVendor(user, dto);
    } catch (error) {
      console.error('Error creating in Vendor merchant and business:', error);
    }
  }

  @Process(AppConfig.QUEUE.JOBS.RIDER_APPROVAL)
  async createBusinessMerchantForRider(job: Job) {
    const { user, dto } = job.data;
    try {
      this.riderService._createBusinessMerchantForRider(user, dto);
    } catch (error) {
      console.error('Error creating in rider merchant and business:', error);
    }
  }

  @Process(AppConfig.QUEUE.BOOKING.SEND_ALERT_EMAIL)
  async bookingEmailAlertForVendor(job: Job) {
    const { bookings, platformFee } = job.data;
    try {
      // this.riderService._createBusinessMerchantForRider(user, dto);
      for (let i = 0; i < bookings.length; i++) {
        const context = {
          vendor_name: bookings[i].vendor.fullName,
          message: `This is a reminder that you have a pending booking of ID #${bookings[i].bookingMasterId}. A lack of action will result in the booking to be rejected automatically after 48 hours. Please find below the details of the booking below:`,
          list: `<ul>
          <li>Booking ID: ${bookings[i].bookingMasterId}</li>
          <li>Booking Date: ${dayjs(bookings[i].bookingDate)
            .tz('Asia/Riyadh')
            .format('DD-MM-YYYY')}</li>
          <li>Customer Name:${bookings[i].customer.fullName} </li>
          <li>Service Amount: ${bookings[i].totalPrice}</li>
          <li>Pickup Delivery Charges Amount: ${
            bookings[i].pickupDeliveryCharges
          }</li>
          <li>Dropoff Delivery Charges Amount: ${
            bookings[i].dropoffDeliveryCharges
          }</li>
          <li>PlatformFee Amount: ${platformFee}</li>
          </ul>`,
          app_name: this.config.get('APP_NAME'),

          copyright_year: this.config.get('COPYRIGHT_YEAR'),
        };
        await this.mailService.sendEmail(
          this.config.get('MAIL_ADMIN'),
          this.config.get('MAIL_NO_REPLY'),
          `${this.config.get('APP_NAME')} - New Booking`,
          'vendor-accept-booking', // `.hbs` extension is appended automatically
          context,
        );
      }
    } catch (error) {
      console.error('Error creating in rider merchant and business:', error);
    }
  }
}
