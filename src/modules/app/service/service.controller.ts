import {
  UseGuards,
  Body,
  Param,
  Controller,
  Post,
  Patch,
  Get,
  Query,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceCreateDto } from './dto';
import { JwtGuard } from '../auth/guard';
import { UserType } from '@prisma/client';
import { Roles } from 'src/core/decorators';
import { RolesGuard } from 'src/core/guards';

@Controller('service')
// @UseGuards(JwtGuard, RolesGuard)
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  // @Roles(UserType.ADMIN)
  @Post('/')
  createService(@Body() data: ServiceCreateDto) {
    return this.serviceService.createService(data);
  }

  // @Roles(UserType.ADMIN)
  @Patch('/:id')
  updateService(@Param('id') id: number, @Body() data: ServiceCreateDto) {
    // return this.serviceService
  }

  // @Roles(UserType.ADMIN)
  @Get('/')
  getService(@Query('take') take: number, @Query('page') page: number) {
    // return this.serviceService
  }
}
