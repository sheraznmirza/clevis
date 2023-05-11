import {
  Controller,
  Get,
  UseGuards,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { ApiTags } from '@nestjs/swagger';
import { CustomerListingParams } from '../../../core/dto';
import { CustomerService } from './customer.service';
import { RolesGuard } from '../../../core/guards';
import { Authorized } from '../../../core/decorators';
import { UserType } from '@prisma/client';
import { UpdateCustomerDto } from './dto';

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

  @Authorized(UserType.CUSTOMER)
  @Get('/:userMasterId')
  getCustomerById(@Param('userMasterId') customerId: number) {
    return this.customerService.getCustomerById(customerId);
  }

  @Authorized(UserType.CUSTOMER)
  @Patch('/me')
  updateMe(@GetUser() user, dto: UpdateCustomerDto) {
    return this.customerService.updateCustomer(user.userMasterId, dto);
  }

  @Authorized(UserType.CUSTOMER)
  @Get('/vendors')
  getVendors(@GetUser() user) {
    return this.customerService.getCustomerById(user);
  }

  @Authorized(UserType.ADMIN)
  @Get()
  getAllCustomers(@Query() listingParams: CustomerListingParams) {
    return this.customerService.getAllCustomers(listingParams);
  }
}
