import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
// import DatabaseService from 'database/database.service';
import { SQSSendNotificationArgs } from '../queue-aws/types';
// import { OneSignalService } from './one_signal.service';
import { NotificationData } from './types';
// import SocketGateway from 'modules/socket/socket.gateway';
import { NotificationReadStatus, UserType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OneSignalService } from './one-signal.service';
import { SocketGateway } from './socket.gateway';
import { ListingParams } from 'src/core/dto';
import { successResponse } from 'src/helpers/response.helper';
import { NotificationUpdateParams } from './dto';
// import { getUserDeviceRoom } from 'helpers/util.helper';
// import { SocketEventNames } from 'constants/socket';
// import { NotificationType } from '../../constants';
@Injectable()
export class NotificationService {
  constructor(
    private _dbService: PrismaService,
    private _oneSignalService: OneSignalService,
  ) {}

  private async _sendNotification(
    sQSSendNotificationArgs: SQSSendNotificationArgs<NotificationData>,
    userType?: UserType,
  ) {
    const { data, userId } = sQSSendNotificationArgs;
    const { entityId, entityType, title, body, type } = data;

    for (let index = 0; index < userId.length; index++) {
      const elem = userId[index];
      const notification = await this._dbService.notification.create({
        data: {
          type,
          title,
          body,
          userMasterId: elem,
          // data: data,
          notificationType: type,
          //   data: {
          //     subscribedUserId: subscribedUser.id,
          //   },
          ...(!!entityId && !!entityId && { entityId: entityId }),
          ...(!!entityType && !!entityType && { entityType: entityType }),
        },
      });

      SocketGateway.emitEvent(
        'notification',
        {
          notification,
        },
        elem.toString(),
      );
      // if (userType === UserType.CUSTOMER) {
      //   const userDevices = await this._dbService.device.findMany({
      //     where: {
      //       userMasterId: elem,
      //       playerId: {
      //         not: null,
      //       },
      //     },
      //     select: {
      //       playerId: true,
      //     },
      //   });
      //   const playerIds = userDevices.map((device) => device.playerId);
      //   if (playerIds.length > 0) {
      //     await this._oneSignalService.sendNotification(playerIds, title, body);
      //   }
      // }

      // const unReadNotificationCount = await this._dbService.notification.count({
      //   where: {
      //     id: subscribedUser.id,
      //     readStatus: NotificationReadStatus.UNREAD,
      //   },
      // });

      // .in(getUserDeviceRoom(elem))
      // .emit(SocketEventNames.NOTIFICATION, {
      //   notification: {
      //     type: NotificationType.NEW_SUBSCRIPTION_ADMIN_NOTIFICATION,
      //     title,
      //     body,
      //     // data: {
      //     //   subscribedUser: subscribedUser.id,
      //     // },
      //   },
      //   unReadNotificationCount,
      // });
    }
  }

  async getAllNotifications(
    userMasterId: number,
    listingParams: ListingParams,
  ) {
    const { page = 1, take = 10 } = listingParams;
    try {
      const notifications = await this._dbService.notification.findMany({
        where: {
          userMasterId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: +take,
        skip: +take * (+page - 1),
      });

      const totalCount = await this._dbService.notification.count({
        where: {
          userMasterId,
        },
      });

      return {
        data: notifications,
        take: +take,
        page: +page,
        totalCount,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateNotification(params: NotificationUpdateParams) {
    try {
      const notificationsId: number[] = params.notificationId
        .split(',')
        .map((item) => parseInt(item));
      await this._dbService.notification.updateMany({
        where: {
          id: {
            in: notificationsId,
          },
        },
        data: {
          readStatus: NotificationReadStatus.READ,
        },
      });
      return successResponse(200, 'Notification read');
    } catch (error) {
      throw error;
    }
  }

  async HandleNotifications(
    notificationArgs: SQSSendNotificationArgs<NotificationData>,
    userType?: UserType,
  ) {
    await this._sendNotification(notificationArgs, userType);
  }
}
