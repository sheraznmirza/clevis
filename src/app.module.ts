import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { NotificationModule } from './modules/app/notification/notification.module';
import { MailModule } from './modules/mail/mail.module';
import { RiderModule } from './modules/app/rider/rider.module';
import MediaModule from './modules/app/media/media.module';
import { RatingModule } from './modules/app/ratingSetup/rating-setup.module';
import { PlatformModule } from './modules/app/platformSetup/platform-setup.module';
import { StatisticsModule } from './modules/app/statistics/statistics.module';
import { BookingModule } from './modules/app/booking/booking.module';
import { AdminModule } from './modules/app/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    // DatabaseModule,
  ],
})
export class AppModule {}
