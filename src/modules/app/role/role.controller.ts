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
import { RoleCreateDto } from './dto';
import { RoleService } from './role.service';
import { blockParams } from 'handlebars';

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

  @Get()
  getAllRoles() {
    return this.roleService.getAllRoles();
  }

  @Authorized(UserType.ADMIN)
  @Delete('/:id')
  deleteAllRoles(@Param('id') id: number) {
    return this.roleService.deleteAllRoles(id);
  }
}
