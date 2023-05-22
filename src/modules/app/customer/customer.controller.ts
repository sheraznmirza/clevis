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
import {
  CustomerListingParams,
  CustomerVendorListingParams,
} from '../../../core/dto';
import { CustomerService } from './customer.service';
import { RolesGuard } from '../../../core/guards';
import { Authorized } from '../../../core/decorators';
import { UserType } from '@prisma/client';
import { UpdateCustomerDto, VendorLocationDto } from './dto';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Customers')
@Controller('customer')
export class CustomerController {
  constructor(private customerService: CustomerService) {}
  @Authorized(UserType.CUSTOMER)
  @Get('me')
  getMe(@GetUser() user) {
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
  updateMe(@GetUser() user, @Body() dto: UpdateCustomerDto) {
    return this.customerService.updateCustomer(user.userMasterId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Authorized(UserType.CUSTOMER)
  @Post('vendors')
  getVendors(@GetUser() user, @Body() dto: VendorLocationDto) {
    return this.customerService.getVendorsByLocation(user.userMasterId, dto);
  }

  @Authorized(UserType.CUSTOMER)
  @Get('vendor/:userMasterId')
  getVendorById(@Param('userMasterId') userMasterId: number) {
    return this.customerService.getVendorById(userMasterId);
  }

  @Authorized(UserType.CUSTOMER)
  @Get('vendor-services/:vendorId')
  getVendorServices(@Param('vendorId') vendorId: number) {
    return this.customerService.getVendorServicesByVendorId(vendorId);
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
