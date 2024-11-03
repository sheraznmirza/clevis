import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { VendorRepository } from './vendor.repository';
import { MailModule } from '../../../modules/mail/mail.module';
import { NotificationModule } from 'src/modules/notification-socket/notification.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TapModule } from 'src/modules/tap/tap.module';
import { ConfigService } from 'aws-sdk';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { TapService } from 'src/modules/tap/tap.service';
@Module({
  imports: [
    MailModule,
    NotificationModule,
    TapModule,
    ConfigModule,
    HttpModule,
  ],
  providers: [
    VendorService,
    VendorRepository,
    ConfigService,
    PrismaService,
    TapService,
  ],
  controllers: [VendorController],
})
export class VendorModule {}
