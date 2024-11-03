import { Module } from '@nestjs/common';
import { MailModule } from '../../mail/mail.module';
import { RiderService } from './rider.service';
import { RiderRepository } from './rider.repository';
import { RiderController } from './rider.controller';
import { TapService } from 'src/modules/tap/tap.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { TapModule } from 'src/modules/tap/tap.module';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [MailModule, PrismaModule, TapModule, ConfigModule, HttpModule],
  providers: [
    RiderService,
    RiderRepository,
    ConfigService,
    PrismaService,
    TapService,
  ],
  controllers: [RiderController],
  exports: [RiderService],
})
export class RiderModule {}
