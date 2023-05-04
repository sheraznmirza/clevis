import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserMaster } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(JwtGuard)
@ApiTags('Customers')
@Controller('customer')
export class CustomerController {
  @Get('me')
  getMe(@GetUser() user: UserMaster) {
    return user;
  }

  @Get()
  getAllCustomers(@GetUser() user: UserMaster) {
    return user;
  }
}
