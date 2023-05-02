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
  Req,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { UserType } from '@prisma/client';
import { Roles, Authorized } from 'src/core/decorators';
import { RolesGuard } from 'src/core/guards';
import { ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
// import { RouteService } from './route.service';
// import { RouteCreateDto } from './dto';

@ApiTags('Notification')
@Controller('notification')
// @UseGuards(JwtGuard, RolesGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  // @Authorized(UserType.ADMIN)
  //   @Post()
  //   createService(@Body() data: RouteCreateDto) {
  //     return this.routeService.createRoute(data);
  //   }

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
  getAllRoute(@Req() req) {
    return this.notificationService.getAllNotifications(req.user.userMasterId);
  }

  //   @Authorized(UserType.ADMIN)
  //   @Delete('/:id')
  //   deleteService(@Param('id') id: number) {
  //     return this.routeService.deleteService(id);
  //   }
}
