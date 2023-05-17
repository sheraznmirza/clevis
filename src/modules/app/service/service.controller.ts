import {
  UseGuards,
  Body,
  Param,
  Controller,
  Post,
  Patch,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceCreateDto, ServiceUpdateDto } from './dto';
import { JwtGuard } from '../auth/guard';
import { UserType } from '@prisma/client';
import { Roles, Authorized } from '../../../core/decorators';
import { RolesGuard } from '../../../core/guards';
import { ApiTags } from '@nestjs/swagger';
import {
  ListingParams,
  ServiceCategorySubCategoryListingParams,
} from '../../../core/dto';
import dayjs from 'dayjs';

@ApiTags('Service')
@Controller('service')
@UseGuards(JwtGuard, RolesGuard)
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Authorized(UserType.ADMIN)
  @Post()
  createService(@Body() data: ServiceCreateDto) {
    return this.serviceService.createService(data);
  }

  @Authorized(UserType.ADMIN)
  @Patch('/:id')
  updateService(@Param('id') id: number, @Body() data: ServiceUpdateDto) {
    return this.serviceService.updateService(id, data);
  }

  @Authorized([UserType.ADMIN, UserType.VENDOR])
  @Get('/:id')
  getService(@Param('id') id: number) {
    return this.serviceService.getService(id);
  }

  @Authorized([UserType.ADMIN, UserType.VENDOR])
  @Get()
  getAllService(
    @Query() listingParams: ServiceCategorySubCategoryListingParams,
  ) {
    console.log(dayjs('umair').isValid());
    return this.serviceService.getAllService(listingParams);
  }

  @Authorized(UserType.ADMIN)
  @Delete('/:id')
  deleteService(@Param('id') id: number) {
    return this.serviceService.deleteService(id);
  }
}
