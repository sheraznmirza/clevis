import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserMaster } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('users')
export class VendorController {
  @Get('me')
  getMe(@GetUser() user: UserMaster) {
    return user;
  }
}
