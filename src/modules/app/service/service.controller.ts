import {
  UseGuards,
  Body,
  Param,
  Controller,
  Post,
  Patch,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceCreateDto } from './dto';
import { JwtGuard } from '../auth/guard';
import { UserType } from '@prisma/client';
import { Roles } from 'src/core/decorators';

@UseGuards(JwtGuard)
@Roles(UserType.ADMIN)
@Controller('service')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Post('/')
  createService(@Body() data: ServiceCreateDto) {
    // return this.serviceService
  }

  @Patch('/:id')
  updateService(@Param('id') id: number, @Body() data: ServiceCreateDto) {
    // return this.serviceService
  }
}
