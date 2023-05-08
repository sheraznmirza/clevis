import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAIL_ENV } from './mailconstant';
import { ForgotPasswordDto } from '../app/auth/dto';
import { Status, UserType } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendUserInvitation(user) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: MAIL_ENV.MAIL_FROM,
        subject: `${this.configService.get(
          'APP_NAME',
        )} - Complete Your Registration`,
        template: 'user-invitation', // `.hbs` extension is appended automatically
        context: {
          app_name: this.configService.get('APP_NAME'),
          register_hash: user.register_hash,
          app_url: this.configService.get('APP_URL') || process.env.APP_URL,
          copyright_year: MAIL_ENV.COPYRIGHT_YEAR,
        },
      });
    } catch (error) {
      // throwExceptionErrorUtil(error)
    }
  }

  async sendResetPasswordEmail(
    resetPasswordDataDto: ForgotPasswordDto,
    otp: number,
  ) {
    try {
      await this.mailerService.sendMail({
        to: resetPasswordDataDto.email,
        from: this.configService.get('MAIL_FROM'),
        subject: `${this.configService.get('APP_NAME')} - Reset Your Password`,
        template: 'resetPassword', // `.hbs` extension is appended automatically
        context: {
          app_name: this.configService.get('APP_NAME'),
          app_url: this.configService.get('APP_URL'),
          copyright_year: MAIL_ENV.COPYRIGHT_YEAR,
          otp,
          //   reset_password_link: `${
          //     this.configService.get('APP_URL') || process.env.APP_URL
          //   }/reset/${user_row.id}/${user_row.register_hash}`,
        },
      });
    } catch (error) {
      console.log('error: ', error);
      throw new ServiceUnavailableException('Unable to send email');
      // throwExceptionErrorUtil(error)
    }
  }

  async confirmResetPasswordEmail(email) {
    try {
      await this.mailerService.sendMail({
        to: email,
        // from: this.configService.get('MAIL_FROM'),
        subject: `${
          this.configService.get('APP_NAME') || process.env.APP_NAME
        } - Password Reset Confirmation`,
        template: 'confirm-password', // `.hbs` extension is appended automatically
        context: {
          app_name: this.configService.get('APP_NAME') || process.env.APP_NAME,
          app_url: this.configService.get('APP_URL') || process.env.APP_URL,
          copyright_year: MAIL_ENV.COPYRIGHT_YEAR,
        },
      });
    } catch (error) {
      // throwExceptionErrorUtil(error)
    }
  }

  async sendVendorApprovalEmail(user: any) {
    try {
      await this.mailerService.sendMail({
        to: user.companyEmail,
        from: MAIL_ENV.MAIL_FROM,
        subject: `${this.configService.get(
          'APP_NAME',
        )} - Vendor ${user.status.toLowerCase()}`,
        template: 'vendorApprovedRejected', // `.hbs` extension is appended automatically
        context: {
          app_name: this.configService.get('APP_NAME'),
          app_url: `${this.configService.get('APP_URL')}`,
          first_name: user.fullName,
          message:
            user.status === Status.APPROVED
              ? 'Your account has been approved. You can now log in and start your journey with us!'
              : 'Your account has been rejected. Please contact our support for further information.',
          copyright_year: MAIL_ENV.COPYRIGHT_YEAR,
        },
      });
    } catch (error) {
      console.log('error: ', error);
      throw new ServiceUnavailableException('Unable to send email');
    }
  }

  async riderVendorCreationEmail(user: any) {
    try {
      await this.mailerService.sendMail({
        // to: 'sheraznabimirza@gmail.com',
        to: user.email,
        from: MAIL_ENV.MAIL_FROM,
        subject: `${this.configService.get('APP_NAME')} - ${
          user.userType
        } created`,
        template: 'vendorApprovedRejected', // `.hbs` extension is appended automatically
        context: {
          app_name: this.configService.get('APP_NAME'),
          app_url: `${this.configService.get('APP_URL')}`,
          first_name: user.fullName,
          message: `${`${
            user[user.userType.toLowerCase()].fullName
          } has signed up and waiting for approval.`}`,
          copyright_year: MAIL_ENV.COPYRIGHT_YEAR,
        },
      });
    } catch (error) {
      console.log('error: ', error);
      throw new ServiceUnavailableException('Unable to send email');
    }
  }

  async sendUserVerificationEmail(
    user: any,
    userType: UserType,
    encrypted: string,
  ) {
    try {
      console.log('working');
      await this.mailerService.sendMail({
        to: user.email,
        from: MAIL_ENV.MAIL_FROM,
        subject: `${this.configService.get(
          'APP_NAME',
        )} - Registration Complete`,
        template: 'userRegistration', // `.hbs` extension is appended automatically
        context: {
          app_name: this.configService.get('APP_NAME'),
          app_url: `${this.configService.get(
            'APP_URL',
          )}/auth/verify-email/${encrypted}`,
          first_name: user[userType.toLowerCase()].fullName,
          copyright_year: MAIL_ENV.COPYRIGHT_YEAR,
        },
      });
    } catch (error) {
      console.log('error: ', error);
      throw new ServiceUnavailableException('Unable to send email');
    }
  }
}
