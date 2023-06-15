import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/app/auth/auth.module';
import { CustomerModule } from './modules/app/customer/customer.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ServiceModule } from './modules/app/service/service.module';
import { CategoryModule } from './modules/app/category/category.module';
import { SubcategoryModule } from './modules/app/subcategory/subcategory.module';
import { AddressModule } from './modules/app/country/address.module';
import { VendorModule } from './modules/app/vendor/vendor.module';
import { RoleModule } from './modules/app/role/role.module';
import { RoleRouteModule } from './modules/app/roleRoute/role-route.module';
import { RouteModule } from './modules/app/route/route.module';
// import { NotificationModule } from './modules/app/notification/notification.module';
import { MailModule } from './modules/mail/mail.module';
import { RiderModule } from './modules/app/rider/rider.module';
import MediaModule from './modules/app/media/media.module';
import { RatingModule } from './modules/app/ratingSetup/rating-setup.module';
import { PlatformModule } from './modules/app/platformSetup/platform-setup.module';
import { StatisticsModule } from './modules/app/statistics/statistics.module';
import { BookingModule } from './modules/app/booking/booking.module';
import { AdminModule } from './modules/app/admin/admin.module';
import { S3Module } from './modules/s3/s3.module';
import { TapModule } from './modules/tap/tap.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { NotificationModule } from './modules/notification-socket/notification.module';
import { SocketGateway } from './modules/notification-socket/socket.gateway';
import { SocketEventHandler } from './modules/notification-socket/socket_event.handler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { JobModule } from './modules/app/job/job.module';
import { join } from 'path';
import { BullQueueModule } from './modules/queue/bull-queue.module';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      serveRoot: '/tap-payment',
      // renderPath: '/tap-api',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('THROTTLE_TTL'),
        limit: config.get('THROTTLE_LIMIT'),
      }),
    }),
    NotificationModule,
    AuthModule,
    AdminModule,
    CustomerModule,
    VendorModule,
    RiderModule,
    PrismaModule,
    ServiceModule,
    CategoryModule,
    SubcategoryModule,
    MediaModule,
    MailModule,
    AddressModule,
    RoleModule,
    RoleRouteModule,
    RouteModule,
    RatingModule,
    PlatformModule,
    StatisticsModule,
    BookingModule,
    S3Module,
    TapModule,
    JobModule,
    BullQueueModule,
    // DatabaseModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    SocketGateway,
    SocketEventHandler,
  ],
})
export class AppModule {}
