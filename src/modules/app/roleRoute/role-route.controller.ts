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
import { UserType } from '@prisma/client';
import { Authorized } from '../../../core/decorators';
import { ApiTags } from '@nestjs/swagger';
import { RoleRouteService } from './role-route.service';
import { RoleRouteCreateDto } from './dto';

@ApiTags('RoleRoute')
@Controller('role-route')
// @UseGuards(JwtGuard, RolesGuard)
export class RoleRouteController {
  constructor(private roleRouteService: RoleRouteService) {}

  //   @Authorized(UserType.ADMIN)
  @Post()
  createRoleRoute(@Body() dto: RoleRouteCreateDto) {
    return this.roleRouteService.createRoleRoute(dto);
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

  @Authorized(UserType.ADMIN)
  @Get()
  getAllRoleRoute() {
    return this.roleRouteService.getAllRoleRoute();
  }

  //   @Authorized(UserType.ADMIN)
  //   @Delete('/:id')
  //   deleteService(@Param('id') id: number) {
  //     return this.routeService.deleteService(id);
  //   }
}
