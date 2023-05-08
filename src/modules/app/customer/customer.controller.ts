import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { ApiTags } from '@nestjs/swagger';
import { CustomerListingParams } from 'src/core/dto';
import { CustomerService } from './customer.service';
import { RolesGuard } from 'src/core/guards';
import { Authorized } from 'src/core/decorators';
import { UserType } from '@prisma/client';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Customers')
@Controller('customer')
export class CustomerController {
  constructor(private customerService: CustomerService) {}
  @Get('me')
  getMe(@GetUser() user) {
    return this.customerService.getCustomerById(user.userMasterId);
  }

  @Authorized(UserType.ADMIN)
  @Get()
  getAllCustomers(@Query() listingParams: CustomerListingParams) {
    return this.customerService.getAllCustomers(listingParams);
  }
}
