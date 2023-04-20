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
import { Roles, Authorized } from 'src/core/decorators';
import { RolesGuard } from 'src/core/guards';
import { ApiTags } from '@nestjs/swagger';
import { RoleCreateDto } from './dto';
import { RoleService } from './role.service';
//   import { RouteService } from './route.service';
//   import { RouteCreateDto } from './dto';

@ApiTags('Role')
@Controller('role')
// @UseGuards(JwtGuard, RolesGuard)
export class RoleController {
  constructor(private roleService: RoleService) {}

  //   @Authorized(UserType.ADMIN)
  @Post()
  createRole(@Body() data: RoleCreateDto) {
    return this.roleService.createRole(data);
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
  getAllRoles() {
    return this.roleService.getAllRoles();
  }

  @Delete()
  deleteAllRoles() {
    return this.roleService.deleteAllRoles();
  }

  //   @Authorized(UserType.ADMIN)
  //   @Delete('/:id')
  //   deleteService(@Param('id') id: number) {
  //     return this.routeService.deleteService(id);
  //   }
}
