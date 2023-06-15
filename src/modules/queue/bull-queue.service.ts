import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { Queue } from 'bull';
import AppConfig from 'src/configs/app.config';

@Injectable()
export class BullQueueService {
  constructor(
    @InjectQueue(AppConfig.QUEUE.NAME.MAIL) private readonly emailQueue: Queue,
  ) {}

  async sendVerificationEmail(user: any, userType: UserType) {
    await this.emailQueue.add(
      AppConfig.QUEUE.JOBS.SEND_VERIFICATION_EMAIL,
      {
        user,
        userType,
      },
      { lifo: false },
    );
  }

  async createCustomerTapAndMail(response: any, user: any) {
    await this.emailQueue.add(
      AppConfig.QUEUE.JOBS.CREATE_CUSTOMER_TAP_AND_MAIL,
      {
        response,
        user,
      },
      { lifo: false },
    );
  }
}
