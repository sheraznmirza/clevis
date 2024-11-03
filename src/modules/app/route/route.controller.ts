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
import { JwtGuard } from '../auth/guard';
import { UserType } from '@prisma/client';
import { Roles, Authorized } from '../../../core/decorators';
import { RolesGuard } from '../../../core/guards';
import { ApiTags } from '@nestjs/swagger';
import { RouteService } from './route.service';
import { RouteCreateDto } from './dto';

@ApiTags('Route')
@Controller('route')
// @UseGuards(JwtGuard, RolesGuard)
export class RouteController {
  constructor(private routeService: RouteService) {}

  // @Authorized(UserType.ADMIN)
  @Post()
  createService(@Body() data: RouteCreateDto) {
    return this.routeService.createRoute(data);
  }

  //   @Authorized(UserType.ADMIN)
  //   @Patch('/:id')
  //   updateService(@Param('id') id: number, @Body() data: route) {
  //     return this.routeService.updateService(id, data);
  //   }

  //   @Authorized(UserType.ADMIN)
  //   @Get('/:id')
  //   getService(@Param('id') id: number) {
  //     return this.routeService.getService(id);
  //   }

  // @Authorized(UserType.ADMIN)
  @Get()
  getAllRoute() {
    return this.routeService.getAllRoute();
  }

  //   @Authorized(UserType.ADMIN)
  //   @Delete('/:id')
  //   deleteService(@Param('id') id: number) {
  //     return this.routeService.deleteService(id);
  //   }
}
