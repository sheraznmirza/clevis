import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/app/auth/auth.module';
import { CustomerModule } from './modules/app/customer/customer.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ServiceModule } from './modules/app/service/service.module';
import { CategoryModule } from './modules/app/category/category.module';
import { SubcategoryModule } from './modules/app/subcategory/subcategory.module';
import { MediaModule } from './modules/app/media/media.module';
import { AddressModule } from './modules/app/country/address.module';
import { VendorModule } from './modules/app/vendor/vendor.module';
import { RoleModule } from './modules/app/role/role.module';
import { RoleRouteModule } from './modules/app/roleRoute/role-route.module';
import { RouteModule } from './modules/app/route/route.module';
import { NotificationModule } from './modules/app/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NotificationModule,
    AuthModule,
    CustomerModule,
    PrismaModule,
    ServiceModule,
    CategoryModule,
    SubcategoryModule,
    MediaModule,
    AddressModule,
    VendorModule,
    RoleModule,
    RoleRouteModule,
    RouteModule,
  ],
})
export class AppModule {}
