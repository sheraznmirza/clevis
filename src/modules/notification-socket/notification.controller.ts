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
import { ApiTags } from '@nestjs/swagger';
import { GetUserType, ListingParams } from 'src/core/dto';
import { GetUser } from '../app/auth/decorator';
import { JwtGuard } from '../app/auth/guard';
import { RolesGuard } from 'src/core/guards';
import { NotificationService } from './notification.service';
import { Authorized } from 'src/core/decorators';
import { NotificationUpdateParams, NotificationUpdateStatus } from './dto';

@ApiTags('Notification')
@Controller('notification')
@UseGuards(JwtGuard, RolesGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Authorized([
    UserType.ADMIN,
    UserType.CUSTOMER,
    UserType.RIDER,
    UserType.VENDOR,
  ])
  @Get()
  getAllNotifications(
    @GetUser() user: GetUserType,
    @Query() listingParams: ListingParams,
  ) {
    return this.notificationService.getAllNotifications(
      user.userMasterId,
      listingParams,
    );
  }

  @Authorized(UserType.CUSTOMER)
  @Get('count')
  getNotificationCount(@GetUser() user: GetUserType) {
    return this.notificationService.getNotificationCount(user.userMasterId);
  }

  @Authorized([
    UserType.ADMIN,
    UserType.CUSTOMER,
    UserType.RIDER,
    UserType.VENDOR,
  ])
  @Get('read-status')
  updateNotificationReadStatus(@Query() params: NotificationUpdateParams) {
    return this.notificationService.updateNotification(params);
  }

  @Authorized([
    UserType.ADMIN,
    UserType.CUSTOMER,
    UserType.RIDER,
    UserType.VENDOR,
  ])
  @Patch('toggle')
  updateNotificationStatus(
    @GetUser() user: GetUserType,
    @Body() dto: NotificationUpdateStatus,
  ) {
    return this.notificationService.updateNotificationStatus(
      user.userMasterId,
      dto,
    );
  }

  //   @Authorized(UserType.ADMIN)
  //   @Delete('/:id')
  //   deleteService(@Param('id') id: number) {
  //     return this.routeService.deleteService(id);
  //   }
}
