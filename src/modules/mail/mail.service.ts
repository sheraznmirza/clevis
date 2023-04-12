import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAIL_ENV } from './mailconstant';
import { VerifyEmailDto } from '../app/auth/dto';

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
    resetPasswordDataDto: VerifyEmailDto,
    otp: number,
  ) {
    try {
      console.log('hello');
      await this.mailerService.sendMail({
        to: resetPasswordDataDto.email,
        // from: this.configService.get('MAIL_FROM'),
        subject: `${this.configService.get('APP_NAME')} - Reset Your Password`,
        template: 'reset-password', // `.hbs` extension is appended automatically
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

  async sendUserRegistrationEmail(user) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: MAIL_ENV.MAIL_FROM,
        subject: `${
          this.configService.get('APP_NAME') || process.env.APP_NAME
        } - Registration Complete`,
        template: 'user-registration', // `.hbs` extension is appended automatically
        context: {
          app_name: this.configService.get('APP_NAME') || process.env.APP_NAME,
          app_url: this.configService.get('APP_URL') || process.env.APP_URL,
          first_name: user?.first_name,
          copyright_year: MAIL_ENV.COPYRIGHT_YEAR,
        },
      });
    } catch (error) {
      // throwExceptionErrorUtil(error)
    }
  }
}
