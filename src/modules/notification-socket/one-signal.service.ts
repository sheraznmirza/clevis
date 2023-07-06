import { Injectable } from '@nestjs/common';
import * as OneSignal from '@onesignal/node-onesignal';
import { CreateNotificationSuccessResponse } from '@onesignal/node-onesignal';
import AppConfig from 'src/configs/app.config';

const user_key_provider = {
  getToken() {
    return AppConfig.NOTIFICATION.ONE_SIGNAL.USER_KEY;
  },
};

const app_key_provider = {
  getToken() {
    return AppConfig.NOTIFICATION.ONE_SIGNAL.APP_KEY;
  },
};

@Injectable()
export class OneSignalService {
  private _client: OneSignal.DefaultApi;

  constructor() {
    this._client = new OneSignal.DefaultApi(
      OneSignal.createConfiguration({
        authMethods: {
          user_key: {
            tokenProvider: user_key_provider,
          },
          app_key: {
            tokenProvider: app_key_provider,
          },
        },
      }),
    );
  }

  async sendNotification(
    playerIds: string[],
    title: string,
    content: string,
    data?: {
      bookingMasterId: number;
      url?: string;
      web_url?: string;
      app_url?: string;
    },
  ): Promise<CreateNotificationSuccessResponse> {
    const notification = new OneSignal.Notification();
    notification.app_id = AppConfig.NOTIFICATION.ONE_SIGNAL.APP_ID;

    notification.include_player_ids = playerIds;
    notification.contents = {
      en: content,
    };
    notification.headings = {
      en: title,
    };
    if (data) {
      // Object.assign(notification, data);
      notification.data = data;
    }
    console.log('one_signal_notification: ', notification);

    return await this._client.createNotification(notification);
  }
}
