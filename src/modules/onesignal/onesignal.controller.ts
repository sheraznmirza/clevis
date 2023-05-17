import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OnesignalService } from './onesignal.service';
import { SendMobileNotificationDto } from './dto/send-notification-mobile.dto';
import { Authorized } from 'src/core/decorators';
import { GetUser } from '../app/auth/decorator';
import { UserType } from '@prisma/client';
import { JwtGuard } from '../app/auth/guard';
import { RolesGuard } from 'src/core/guards';

@ApiTags('One signal')
@UseGuards(JwtGuard, RolesGuard)
@Controller('onesignal')
export class OnesignalController {
  constructor(private readonly oneSignalService: OnesignalService) {}

  @Post('/send-notification')
  @Authorized(UserType.ADMIN)
  async sendNotification(
    @Body() sendMobileNotificationDto: SendMobileNotificationDto,
    @GetUser() user,
  ) {
    return this.oneSignalService.sendNotification(
      sendMobileNotificationDto,
      // user,
    );
  }

  // @Post('add-user-to-notification-list')
  // @ApiResponses(true, [Role.ADMIN, Role.STUDENT])
  // async addUserToNotificationList(
  //   @Query('userId') userId: string,
  //   @Query('playerId') playerId: string,
  // ) {
  //   const result = await this.oneSignalService.addUserToNotificationList(
  //     userId,
  //     playerId,
  //   );

  //   if (!result.success) {
  //     throw new HttpException(result.message, result.statusCode);
  //   }

  //   return result;
  // }

  // @Post('remove-user-from-notification-list')
  // @ApiResponses(true, [Role.ADMIN, Role.STUDENT])
  // async removeUserFromNotificationList(
  //   @Query('userId') userId: string,
  //   @Query('playerId') playerId: string,
  // ) {
  //   const result = await this.oneSignalService.removeUserFromNotificationList(
  //     userId,
  //     playerId,
  //   );

  //   if (!result.success) {
  //     throw new HttpException(result.message, result.statusCode);
  //   }

  //   return result;
  // }

  // @Get('mark-all-notification-as-read')
  // @ApiResponses(true, [Role.STUDENT])
  // async markAllNotificationAsRead(@CurrentUser() user: User) {
  //   await user.save();
  //   return {
  //     success: true,
  //   };
  // }
}
