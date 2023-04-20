import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserMaster } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(JwtGuard)
@ApiTags('Users')
@Controller('users')
export class UserController {
  @Get('me')
  getMe(@GetUser() user: UserMaster) {
    return user;
  }
}
