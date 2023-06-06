import { EntityType } from '@prisma/client';
import { NotificationType } from '../../constants';

export type NotificationData = {
  title: string;
  body: string;
  type: NotificationType;
  entityType?: EntityType;
  entityId?: number;
};
