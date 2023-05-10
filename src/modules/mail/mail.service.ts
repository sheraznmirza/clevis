import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from '../app/auth/dto';
import { Status, UserType } from '@prisma/client';
import { Context } from './entity';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private config: ConfigService,
  ) {}

  async sendUserInvitation(user) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: this.config.get('MAIL_FROM'),
        subject: `${this.config.get('APP_NAME')} - Complete Your Registration`,
        template: 'user-invitation', // `.hbs` extension is appended automatically
        context: {
          app_name: this.config.get('APP_NAME'),
          register_hash: user.register_hash,
          app_url: this.config.get('APP_URL') || process.env.APP_URL,
          copyright_year: this.config.get('COPYRIGHT_YEAR'),
        },
      });
    } catch (error) {
      // throwExceptionErrorUtil(error)
    }
  }

  // async sendResetPasswordEmail(
  //   resetPasswordDataDto: ForgotPasswordDto,
  //   otp: number,
  // ) {

  //   try {

  // const context = {
  //   pp_name: this.config.get('APP_NAME'),                       umair
  //   app_url: this.config.get('APP_URL'),
  //   copyright_year: this.config.get('COPYRIGHT_YEAR'),
  //   otp,
  // };
  // await this.mailerService.sendMail({
  //   to: resetPasswordDataDto.email,
  //   from: this.config.get('MAIL_FROM'),
  //   subject: `${this.config.get('APP_NAME')} - Reset Your Password`,
  //   template: 'resetPassword', // `.hbs` extension is appended automatically
  //   context,
  //   } );

  // await this.mailerService.sendMail({
  //   to: resetPasswordDataDto.email,
  //   from: this.config.get('MAIL_FROM'),
  //   subject: `${this.config.get('APP_NAME')} - Reset Your Password`,
  //   template: 'resetPassword', // `.hbs` extension is appended automatically
  //   context: {
  //     app_name: this.config.get('APP_NAME'),
  //     app_url: this.config.get('APP_URL'),
  //     copyright_year: this.config.get('COPYRIGHT_YEAR'),
  //     otp,
  //     //   reset_password_link: `${
  //     //     this.config.get('APP_URL') || process.env.APP_URL
  //     //   }/reset/${user_row.id}/${user_row.register_hash}`,
  //   },
  // });
  //   } catch (error) {
  //     console.log('error: ', error);
  //     throw new ServiceUnavailableException('Unable to send email');
  //     // throwExceptionErrorUtil(error)
  //   }
  // }

  async confirmResetPasswordEmail(email) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: this.config.get('MAIL_FROM'),
        subject: `${
          this.config.get('APP_NAME') || process.env.APP_NAME
        } - Password Reset Confirmation`,
        template: 'confirm-password', // `.hbs` extension is appended automatically
        context: {
          app_name: this.config.get('APP_NAME') || process.env.APP_NAME,
          app_url: this.config.get('APP_URL') || process.env.APP_URL,
          copyright_year: this.config.get('COPYRIGHT_YEAR'),
        },
      });
    } catch (error) {
      // throwExceptionErrorUtil(error)
    }
  }

  // async sendVendorRiderApprovalEmail(user: any) {
  //   try {

  // const context = {
  //   app_name: this.config.get('APP_NAME'),
  //   app_url: `${this.config.get('APP_URL')}`,
  //   first_name: user.fullName,                                       umair
  //   message:
  //     user.status === Status.APPROVED
  //       ? 'Your account has been approved. You can now log in and start your journey with us!'
  //       : 'Your account has been rejected. Please contact our support for further information.',
  //   copyright_year: this.config.get('COPYRIGHT_YEAR'),
  // };
  // await this.sendEmail(
  //   user.companyEmail,
  //   this.config.get('MAIL_FROM'),
  //      `${this.config.get('APP_NAME')} - ${
  //       user.userType[0] + user.userType.slice(1).toLowerCase()
  //     } ${user.status.toLowerCase()}`,
  //     'vendorApprovedRejected',
  //     context // `.hbs` extension is appended automatically
  //   );

  //     const context = {
  //       app_name: this.config.get('APP_NAME'),
  //       app_url: `${this.config.get('APP_URL')}`,
  //       first_name: user.fullName,
  //       message:
  //         user.status === Status.APPROVED
  //           ? 'Your account has been approved. You can now log in and start your journey with us!'
  //           : 'Your account has been rejected. Please contact our support for further information.',
  //       copyright_year: this.config.get('COPYRIGHT_YEAR'),
  //     };
  //     await this.sendEmail(
  //     user.companyEmail,
  //     this.config.get('MAIL_FROM'),
  //        `${this.config.get('APP_NAME')} - ${
  //         user.userType[0] + user.userType.slice(1).toLowerCase()
  //       } ${user.status.toLowerCase()}`,
  //       'vendorApprovedRejected',
  //       context // `.hbs` extension is appended automatically
  //     );
  //   }
  // }

  // await this.mailerService.sendMail({
  //   to: user.companyEmail,
  //   from: this.config.get('MAIL_FROM'),
  //   subject: `${this.config.get('APP_NAME')} - ${
  //     user.userType[0] + user.userType.slice(1).toLowerCase()
  //   } ${user.status.toLowerCase()}`,
  //   template: 'vendorApprovedRejected', // `.hbs` extension is appended automatically
  //   context: {
  //     app_name: this.config.get('APP_NAME'),
  //     app_url: `${this.config.get('APP_URL')}`,
  //     first_name: user.fullName,
  //     message:
  //       user.status === Status.APPROVED
  //         ? 'Your account has been approved. You can now log in and start your journey with us!'
  //         : 'Your account has been rejected. Please contact our support for further information.',
  //     copyright_year: this.config.get('COPYRIGHT_YEAR'),
  //   },
  // });
  //    catch (error) {
  //     console.log('error: ', error);
  //     throw new ServiceUnavailableException('Unable to send email');
  //   }
  // }

  // async riderVendorCreationEmail(user: any) {
  //   try {
  //     await this.mailerService.sendMail({
  //       // to: 'sheraznabimirza@gmail.com',
  //       to: user.email,
  //       from: this.config.get('MAIL_FROM'),
  //       subject: `${this.config.get('APP_NAME')} - Account has been created`,
  //       template: 'vendorApprovedRejected', // `.hbs` extension is appended automatically
  //       context: {
  //         app_name: this.config.get('APP_NAME'),
  //         app_url: `${this.config.get('APP_URL')}`,
  //         first_name: user[user.userType.toLowerCase()].fullName,
  //         message: `${`${
  //           user[user.userType.toLowerCase()].fullName
  //         } has signed up and waiting for approval.`}`,
  //         copyright_year: this.config.get('COPYRIGHT_YEAR'),
  //       },
  //       // template: 'userRegistration', // `.hbs` extension is appended automatically
  //       // context: {
  //       //   app_name: this.config.get('APP_NAME'),
  //       //   app_url: `${this.config.get('APP_URL')}/auth/verify-email/`,
  //       //   first_name: 'rider bois',
  //       //   copyright_year: this.config.get('COPYRIGHT_YEAR'),
  //       // },
  //     });
  //   } catch (error) {
  //     console.log('error: ', error);
  //     throw new ServiceUnavailableException('Unable to send email');
  //   }
  // }

  // async sendUserVerificationEmail(
  //   user: any,
  //   userType: UserType,
  //   encrypted: string,
  // ) {
  //   try {

  //   } catch (error) {
  //     console.log('error: ', error);
  //     throw new ServiceUnavailableException('Unable to send email');
  //   }
  // }

  async sendEmail(
    to: string,
    from: string,
    subject: string,
    template: string,
    context: any,
  ) {
    try {
      await this.mailerService.sendMail({
        to,
        from,
        subject: `${this.config.get('APP_NAME')} - ${subject}`,
        template, // `.hbs` extension is appended automatically
        context,
      });
    } catch (error) {
      console.log('error: ', error);
      throw new ServiceUnavailableException('Unable to send email');
    }
  }
}
