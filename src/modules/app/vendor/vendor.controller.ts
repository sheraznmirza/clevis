import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
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
  CreateAndUpdateDeliverySchedule,
  UpdateVendorDto,
  UpdateVendorScheduleDto,
  VendorCreateServiceDto,
  VendorUpdateBusyStatusDto,
  UpdateRequestDto,
  VendorUpdateServiceDto,
  VendorUpdateStatusDto,
  GetRiderListing,
} from './dto';
import { VendorService } from './vendor.service';
import {
  GetUserType,
  VendorListingParams,
  VendorRiderByIdParams,
  VendorServiceListingParams,
} from 'src/core/dto';
import { User } from '@onesignal/node-onesignal';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Vendor')
@Controller('vendor')
export class VendorController {
  constructor(private vendorService: VendorService) {}
  @Authorized(UserType.VENDOR)
  @Get('me')
  getMe(@GetUser() user: GetUserType, @Query() query: VendorRiderByIdParams) {
    return this.vendorService.getVendorById(
      user.userMasterId,
      query,
      user.userTypeId,
    );
  }

  @Authorized(UserType.VENDOR)
  @Get('rider-directory')
  getRiderDirectory(
    @GetUser() user: GetUserType,
    @Query() listingParams: GetRiderListing,
  ) {
    return this.vendorService.getRiderDirectory(user, listingParams);
  }

  // @Authorized(UserType.VENDOR)
  // @Get('/dashboard')
  // getDashboard(@GetUser() user: GetUserType) {
  //   return this.vendorService.getDashboard(user);
  // }

  @Authorized(UserType.ADMIN)
  @Get('/byId/:userMasterId')
  getVendorById(@Param('userMasterId') userMasterId: number) {
    return this.vendorService.getVendorById(userMasterId);
  }

  @Authorized(UserType.VENDOR)
  @Post('/service')
  createVendorService(
    @Body() dto: VendorCreateServiceDto,
    @GetUser() user: GetUserType,
  ) {
    return this.vendorService.createVendorService(dto, user);
  }

  @Authorized(UserType.VENDOR)
  @Post('/request-update')
  requestUpdate(@Body() dto: UpdateRequestDto, @GetUser() user: GetUserType) {
    return this.vendorService.requestUpdate(dto, user.userTypeId);
  }

  @Authorized(UserType.VENDOR)
  @Patch('/service/:vendorServiceId')
  updateVendorService(
    @Param('vendorServiceId') vendorServiceId: number,
    @Body() dto: VendorUpdateServiceDto,
    @GetUser() user: GetUserType,
  ) {
    return this.vendorService.updateVendorService(
      dto,
      user.userMasterId,
      vendorServiceId,
    );
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
  @Patch('/busy/:vendorId')
  busyStatusVendor(
    @GetUser() user: GetUserType,
    @Body() dto: VendorUpdateBusyStatusDto,
  ) {
    return this.vendorService.updateBusyStatusVendor(user.userTypeId, dto);
  }

  @Authorized([UserType.VENDOR])
  @HttpCode(HttpStatus.OK)
  @Patch('/me')
  updateMe(@GetUser() user: GetUserType, @Body() dto: UpdateVendorDto) {
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
  updateVendorSchedule(
    @GetUser() user: GetUserType,
    @Body() dto: UpdateVendorScheduleDto,
  ) {
    return this.vendorService.updateVendorSchedule(user.userTypeId, dto);
  }

  @Authorized([UserType.ADMIN, UserType.CUSTOMER])
  @Get()
  getVendors(@Query() listingParams: VendorListingParams) {
    return this.vendorService.getAllVendors(listingParams);
  }

  @Authorized([UserType.VENDOR, UserType.CUSTOMER])
  @Get('/services')
  getAllVendorService(
    @GetUser() user: GetUserType,
    @Query() listingParams: VendorServiceListingParams,
  ) {
    return this.vendorService.getVendorAllService(
      user.userTypeId,
      listingParams,
    );
  }

  @Authorized([UserType.VENDOR, UserType.ADMIN])
  @Get('/service-names')
  getVendorServices(@GetUser() user: GetUserType) {
    return this.vendorService.getVendorServices(user.userTypeId);
  }

  @Authorized(UserType.VENDOR)
  @Get('/services/:vendorServiceId')
  getVendorServiceById(@Param('vendorServiceId') vendorServiceId: number) {
    return this.vendorService.getVendorServiceById(vendorServiceId);
  }

  @Authorized(UserType.ADMIN)
  @Delete('/:userMasterId')
  deleteRider(@Param('userMasterId') userMasterId: number) {
    return this.vendorService.deleteVendor(userMasterId);
  }

  @Authorized(UserType.VENDOR)
  @Delete('/vendor-service/:vendorServiceId')
  deleteVendorService(@Param('vendorServiceId') vendorServiceId: number) {
    return this.vendorService.deleteVendorService(vendorServiceId);
  }

  @Authorized(UserType.VENDOR)
  @Post('/delivery-schedule')
  createDeliverySchedule(
    @Body() dto: CreateAndUpdateDeliverySchedule,
    @GetUser() user: GetUserType,
  ) {
    return this.vendorService.createDeliverySchedule(dto, user.userTypeId);
  }

  @Authorized(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('/delivery/byId/:vendorId')
  deliveryScheduleAdminUpdate(
    @Param('vendorId') vendorId: number,
    @Body() dto: CreateAndUpdateDeliverySchedule,
  ) {
    return this.vendorService.deliveryScheduleUpdate(vendorId, dto);
  }

  @Authorized(UserType.VENDOR)
  @HttpCode(HttpStatus.OK)
  @Patch('/delivery')
  deliveryScheduleVendorUpdate(
    @GetUser() user: GetUserType,
    @Body() dto: CreateAndUpdateDeliverySchedule,
  ) {
    return this.vendorService.deliveryScheduleUpdate(user.userTypeId, dto);
  }

  // @Authorized(UserType.VENDOR)
  // @Get('/deliverySchedule/:vendorId')
  // getVendorDeliverySchedule(@GetUser() user : GetUserType) {
  //   return this.vendorService.getDeliverySchedule(user.userTypeId);
  // }

  // @Authorized(UserType.ADMIN)
  // @Get('/deliverySchedule/:vendorId')
  // getDeliveryScheduleByVendorId(@Param('vendorId') vendorId: number) {
  //   return this.vendorService.getDeliverySchedule(vendorId);
  // }
}
