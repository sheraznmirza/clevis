import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '../../../core/guards';
import { Authorized } from '../../../core/decorators';
import { UserType } from '@prisma/client';
import { AdminService } from './admin.service';
import { ListingParams } from 'src/core/dto';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Authorized(UserType.ADMIN)
  @Get('/update-requests')
  getUpdateRequests(@Query() dto: ListingParams) {
    return this.adminService.getUpdateRequests(dto);
  }
}
