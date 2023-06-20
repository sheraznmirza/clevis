import { Controller, Get, Query, Body, UseGuards } from '@nestjs/common';
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
  @Get('detail/rider')
  getDetail(@GetUser() user: GetUserType) {
    return this.earningservice.getDetailRider(user.userTypeId);
  }

  @Authorized(UserType.VENDOR)
  @Get('detail/vendor')
  getDetailVendor(@GetUser() user: GetUserType) {
    return this.earningservice.getDetailVendor(user.userTypeId);
  }

  @Authorized(UserType.ADMIN)
  @Get('detail/vendor')
  getDetailAdmin(@GetUser() user: GetUserType) {
    return this.earningservice.getDetailAdmin(user.userTypeId);
  }
}
