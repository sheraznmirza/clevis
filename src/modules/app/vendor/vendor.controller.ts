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
import {
  UpdateVendorDto,
  UpdateVendorScheduleDto,
  VendorCreateServiceDto,
  VendorUpdateStatusDto,
} from './dto';
import { VendorService } from './vendor.service';
import {
  ListingParams,
  VendorListingParams,
  VendorRiderByIdParams,
} from 'src/core/dto';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Vendor')
@Controller('vendor')
export class VendorController {
  constructor(private vendorService: VendorService) {}
  @Authorized(UserType.VENDOR)
  @Get('me')
  getMe(@GetUser() user, @Query() query: VendorRiderByIdParams) {
    return this.vendorService.getVendorById(user.userMasterId, query);
  }

  @Authorized(UserType.ADMIN)
  @Get('byId/:userMasterId')
  getVendorById(@Param('userMasterId') userMasterId: number) {
    return this.vendorService.getVendorById(userMasterId);
  }

  @Authorized(UserType.VENDOR)
  @Post('/service')
  createVendorService(@Body() dto: VendorCreateServiceDto, @Req() req) {
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

  @Authorized(UserType.VENDOR)
  @HttpCode(HttpStatus.OK)
  @Patch('/me')
  updateMe(@GetUser() user, @Body() dto: UpdateVendorDto) {
    return this.vendorService.updateVendor(user.userMasterId, dto);
  }

  @Authorized(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('/byId/:userMasterId')
  updateVendor(
    @Param('userMasterId') userMasterId: number,
    @Body() dto: UpdateVendorDto,
  ) {
    return this.vendorService.updateVendor(userMasterId, dto);
  }

  @Authorized(UserType.VENDOR)
  @HttpCode(HttpStatus.OK)
  @Patch('/schedule')
  updateVendorSchedule(@GetUser() user, @Body() dto: UpdateVendorScheduleDto) {
    return this.vendorService.updateVendorSchedule(user.userTypeId, dto);
  }

  @Authorized([UserType.ADMIN, UserType.CUSTOMER])
  @Get()
  getVendors(@Query() listingParams: VendorListingParams) {
    return this.vendorService.getAllVendors(listingParams);
  }

  @Authorized([UserType.VENDOR, UserType.CUSTOMER])
  @Get('/services')
  getAllVendorService(@GetUser() user, @Query() listingParams: ListingParams) {
    console.log('user: ', user);
    return this.vendorService.getVendorAllService(
      user.userTypeId,
      listingParams,
    );
  }

  @Authorized(UserType.ADMIN)
  @Delete('/:userMasterId')
  deleteRider(@Param('userMasterId') riderId: number) {
    return this.vendorService.deleteVendor(riderId);
  }
}
