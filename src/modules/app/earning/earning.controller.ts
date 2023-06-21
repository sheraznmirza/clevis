import { Controller, Get, Query, Body, UseGuards, Param } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { Authorized } from 'src/core/decorators';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { GetUser } from '../auth/decorator';
import { GetUserType } from 'src/core/dto';
import { EarningDto } from './dto';
import { EarningService } from './earning.service';
import { ApiTags } from '@nestjs/swagger';
import { VendorEarning } from './dto/vendor-earning.dto';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from 'src/core/guards';
import { riders } from 'src/seeders/constants';

@ApiTags('Earning')
@UseGuards(JwtGuard, RolesGuard)
@Controller('earning')
export class EarningController {
  constructor(private earningservice: EarningService) {}
  @Authorized(UserType.ADMIN)
  @Get('All')
  getAllEarnings(@Query() dto: EarningDto) {
    return this.earningservice.getAllEarnings(dto);
  }

  @Authorized(UserType.VENDOR)
  @Get('vendor')
  getVendorEarning(@GetUser() user: GetUserType, @Query() dto: VendorEarning) {
    return this.earningservice.getVendorEarning(user.userTypeId, dto);
  }

  @Authorized(UserType.RIDER)
  @Get('rider')
  getRiderEarning(@GetUser() user: GetUserType, @Query() dto: VendorEarning) {
    return this.earningservice.getRiderEarning(user.userTypeId, dto);
  }

  @Authorized(UserType.RIDER)
  @Get('rider/earning/detail/:id')
  getDetail(@Param('id') id: number) {
    return this.earningservice.getDetailRider(id);
  }

  @Authorized(UserType.VENDOR)
  @Get('vendor/earning/detail/:id')
  getDetailVendor(@Param('id') id: number) {
    return this.earningservice.getDetailVendor(id);
  }

  @Authorized(UserType.ADMIN)
  @Get('admin/earning/detail/:id')
  getDetailAdmin(@Param('id') id: number) {
    return this.earningservice.getDetailAdmin(id);
  }
}
