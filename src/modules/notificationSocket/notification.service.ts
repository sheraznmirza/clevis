import { Injectable } from '@nestjs/common';
// import DatabaseService from 'database/database.service';
import { SQSSendNotificationArgs } from '../queue-aws/types';
import { OneSignalService } from './one_signal.service';
import { NotificationDataT } from './types';
// import SocketGateway from 'modules/socket/socket.gateway';
import { NotificationReadStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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
    sQSSendNotificationArgs: SQSSendNotificationArgs<NotificationDataT>,
  ) {
    const { data, userId } = sQSSendNotificationArgs;
    const { entityId, entityType, title, body, type } = data;

    for (let index = 0; index < userId.length; index++) {
      const elem = userId[index];
      await this._dbService.notification.create({
        data: {
          type,
          title,
          body,
          userMasterId: elem,
          data: {
            loura: 'dwada',
          },
          notificationType: 'RiderCreated',
          //   data: {
          //     subscribedUserId: subscribedUser.id,
          //   },
          ...(!!entityId && !!entityId && { entityId: entityId }),
          ...(!!entityType && !!entityType && { entityType: entityType }),
        },
      });

      const userDevices = await this._dbService.device.findMany({
        where: {
          userMasterId: elem,
          playerId: {
            not: null,
          },
        },
        select: {
          playerId: true,
        },
      });
      const playerIds = userDevices.map((device) => device.playerId);
      if (playerIds.length > 0) {
        await this._oneSignalService.sendNotification(playerIds, title, body);
      }

      //   const unReadNotificationCount = await this._dbService.notification.count({
      //     where: {
      //       id: subscribedUser.id,
      //       readStatus: NotificationReadStatus.UNREAD,
      //     },
      //   });

      // SocketGateway._io.in(getUserDeviceRoom(elem)).emit(SocketEventNames.NOTIFICATION, {
      //     notification: {
      //         type: NotificationType.NEW_SUBSCRIPTION_ADMIN_NOTIFICATION,
      //         title,
      //         body,
      //         data: {
      //             subscribedUser: subscribedUser.id,
      //         },
      //     },
      //     unReadNotificationCount,
      // });
    }
  }

  async HandleNotifications(
    notificationArgs: SQSSendNotificationArgs<NotificationDataT>,
  ) {
    await this._sendNotification(notificationArgs);
  }
}
