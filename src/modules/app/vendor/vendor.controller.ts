import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserMaster, UserType } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from 'src/core/guards';
import { Authorized } from 'src/core/decorators';
import { ApiTags } from '@nestjs/swagger';
import { VendorCreateServiceDto, VendorUpdateStatusDto } from './dto';
import { VendorService } from './vendor.service';
import { Request } from 'express';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Vendor')
@Controller('vendor')
export class VendorController {
  constructor(private vendorService: VendorService) {}
  @Authorized(UserType.VENDOR)
  @Get('me')
  getMe(@GetUser() user) {
    console.log('user: ', user);
    return user;
  }

  // @Authorized(UserType.VENDOR)
  @Post('/service')
  createVendorService(@Body() dto: VendorCreateServiceDto, @Req() req) {
    console.log('req: ', req.user?.userMasterId);
    console.log('dto: ', dto);
    return this.vendorService.createVendorService(dto, req.user?.userMasterId);
  }

  @Authorized(UserType.ADMIN)
  @Patch('/approve/:vendorId')
  approveVendor(
    @Param('vendorId') vendorId: number,
    @Body() dto: VendorUpdateStatusDto,
  ) {
    console.log('id,', vendorId, dto);
    return this.vendorService.approveVendor(vendorId, dto);
  }
}
