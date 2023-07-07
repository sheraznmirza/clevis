import { Controller, Get, Query, Body, UseGuards, Param } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { Authorized } from 'src/core/decorators';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { GetUser } from '../auth/decorator';
import { GetUserType } from 'src/core/dto';
import { EarningDto, EarningDtos } from './dto';
import { EarningService } from './earning.service';
import { ApiTags } from '@nestjs/swagger';
import { VendorEarning } from './dto/vendor-earning.dto';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from 'src/core/guards';
import { riders } from 'src/seeders/constants';
import { RiderEarning } from './dto/rider-earning.dto';

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
    return this.earningservice.getVendorEarning(user.userMasterId, dto);
  }

  @Authorized(UserType.ADMIN)
  @Get('vendor/byId/:vendorId')
  getVendorEarningById(
    @Param('vendorId') vendorId: number,
    @Query() dto: VendorEarning,
  ) {
    return this.earningservice.getVendorEarning(vendorId, dto);
  }

  @Authorized(UserType.RIDER)
  @Get('rider')
  getRiderEarning(@GetUser() user: GetUserType, @Query() dto: RiderEarning) {
    return this.earningservice.getRiderEarning(user.userTypeId, dto);
  }

  @Authorized(UserType.ADMIN)
  @Get('rider/byId/:riderId')
  getRiderEarningById(
    @Param('riderId') id: number,
    @Query() dto: RiderEarning,
  ) {
    return this.earningservice.getRiderEarning(id, dto);
  }

  @Authorized([UserType.RIDER, UserType.ADMIN])
  @Get('rider/detail/:id')
  getDetail(@Param('id') id: number) {
    return this.earningservice.getDetailRider(id);
  }

  @Authorized([UserType.VENDOR, UserType.ADMIN])
  @Get('vendor/detail/:id')
  getDetailVendor(@Param('id') id: number) {
    return this.earningservice.getDetailVendor(id);
  }

  @Authorized(UserType.ADMIN)
  @Get('admin/detail/:id')
  getDetailAdmin(@Param('id') id: number, @Query() dto: EarningDtos) {
    return this.earningservice.getDetailAdmin(id, dto);
  }
}
