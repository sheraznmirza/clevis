import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import { UserType } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from '../../../core/guards';
import { Authorized } from '../../../core/decorators';
import { ApiTags } from '@nestjs/swagger';
import { VendorCreateServiceDto, VendorUpdateStatusDto } from './dto';
import { VendorService } from './vendor.service';
import { VendorListingParams } from 'src/core/dto';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Vendor')
@Controller('vendor')
export class VendorController {
  constructor(private vendorService: VendorService) {}
  @Authorized(UserType.VENDOR)
  @Get('me')
  getMe(@GetUser() user) {
    return this.vendorService.getVendorById(user.userMasterId);
  }

  @Authorized(UserType.ADMIN)
  @Get('/:userMasterId')
  getVendorById(@Param('userMasterId') vendorId: number) {
    return this.vendorService.getVendorById(vendorId);
  }

  @Authorized(UserType.VENDOR)
  @Post('/service')
  createVendorService(@Body() dto: VendorCreateServiceDto, @Req() req) {
    console.log('req: ', req.user?.userMasterId);
    console.log('dto: ', dto);
    return this.vendorService.createVendorService(dto, req.user?.userMasterId);
  }

  @Authorized(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('/approve/:vendorId')
  approveVendor(
    @Param('vendorId') vendorId: number,
    @Query() dto: VendorUpdateStatusDto,
  ) {
    return this.vendorService.approveVendor(vendorId, dto);
  }

  @Authorized([UserType.ADMIN, UserType.CUSTOMER])
  @Get()
  getVendors(@Query() listingParams: VendorListingParams) {
    return this.vendorService.getAllVendors(listingParams);
  }

  @Authorized(UserType.ADMIN)
  @Delete('/:userMasterId')
  deleteRider(@Param('userMasterId') riderId: number) {
    return this.vendorService.deleteVendor(riderId);
  }
}
