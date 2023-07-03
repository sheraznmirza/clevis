import {
  Controller,
  Post,
  Get,
  UseGuards,
  Query,
  Param,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { ApiTags } from '@nestjs/swagger';
import { CustomerListingParams, GetUserType } from '../../../core/dto';
import { CustomerService } from './customer.service';
import { RolesGuard } from '../../../core/guards';
import { Authorized } from '../../../core/decorators';
import { UserType } from '@prisma/client';
import {
  UpdateCustomerDto,
  VendorLocationDto,
  VendorServiceCarWashParams,
  VendorServiceParams,
} from './dto';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Customers')
@Controller('customer')
export class CustomerController {
  constructor(private customerService: CustomerService) {}
  @Authorized(UserType.CUSTOMER)
  @Get('me')
  getMe(@GetUser() user: GetUserType) {
    return this.customerService.getCustomerById(user.userMasterId);
  }

  @Authorized(UserType.ADMIN)
  @Get('/byId/:userMasterId')
  getCustomerById(@Param('userMasterId') customerId: number) {
    return this.customerService.getCustomerById(customerId);
  }

  @Authorized(UserType.ADMIN)
  @Patch('/byId/:userMasterId')
  updateCustomer(
    @Param('userMasterId') userMasterId: number,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.updateCustomer(userMasterId, dto);
  }

  @Authorized(UserType.CUSTOMER)
  @Patch('me')
  updateMe(@GetUser() user: GetUserType, @Body() dto: UpdateCustomerDto) {
    return this.customerService.updateCustomer(user.userMasterId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Authorized(UserType.CUSTOMER)
  @Post('vendors')
  getVendors(@GetUser() user: GetUserType, @Body() dto: VendorLocationDto) {
    return this.customerService.getVendorsByLocation(user.userMasterId, dto);
  }

  @Authorized(UserType.CUSTOMER)
  @Get('vendor/:userMasterId')
  getVendorById(@Param('userMasterId') userMasterId: number) {
    return this.customerService.getVendorById(userMasterId);
  }

  @Authorized(UserType.CUSTOMER)
  @Get('vendor-services/:vendorId')
  getVendorServices(
    @Param('vendorId') vendorId: number,
    @Query() dto: VendorServiceParams,
  ) {
    return this.customerService.getVendorServicesByVendorId(vendorId, dto);
  }

  @Authorized(UserType.CUSTOMER)
  @Get('car-wash-vendor-services/:vendorId')
  getVendorServicesCarWash(
    @Param('vendorId') vendorId: number,
    @Query() dto: VendorServiceCarWashParams,
  ) {
    return this.customerService.getVendorServicesCarWashByVendorId(
      vendorId,
      dto,
    );
  }

  @Authorized(UserType.ADMIN)
  @Get()
  getAllCustomers(@Query() listingParams: CustomerListingParams) {
    return this.customerService.getAllCustomers(listingParams);
  }

  @Authorized(UserType.ADMIN)
  @Delete('/:userMasterId')
  deleteCustomer(@Param('userMasterId') userMasterId: number) {
    return this.customerService.deleteCustomer(userMasterId);
  }
}
