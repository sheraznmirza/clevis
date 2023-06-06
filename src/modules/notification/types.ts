import { EntityType } from '@prisma/client';
import { NotificationType } from '../../constants';

export type NotificationDataT = {
  title: string;
  body: string;
  type: NotificationType;
  entityType?: EntityType;
  entityId?: number;
};
