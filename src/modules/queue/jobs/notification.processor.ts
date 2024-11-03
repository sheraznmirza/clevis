import { Process, Processor } from '@nestjs/bull';
import AppConfig from 'src/configs/app.config';
import { Injectable } from '@nestjs/common';
import { Job } from '@prisma/client';

@Injectable()
@Processor(AppConfig.QUEUE.NAME.NOTIFICATION)
export class MailProcessor {
  constructor() {}

  //   @Process(AppConfig.QUEUE.JOBS.VENDOR_RIDER_APPROVAL)
  //   async createBusinessMerchantForVendor(job: Job) {
  //     const { user, dto } = job.data;
  //     try {
  //       this.vendorService._createBusinessMerchantForVendor(user, dto);
  //     } catch (error) {
  //       console.error('Error creating in Vendor merchant and business:', error);
  //     }
  //   }
}
