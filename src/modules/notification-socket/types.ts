import { EntityType, NotificationType } from '@prisma/client';
import { NotificationSocketType } from '../../constants';

export type NotificationData = {
  title: string;
  body: string;
  type: NotificationType;
  entityType?: EntityType;
  entityId?: number;
};
