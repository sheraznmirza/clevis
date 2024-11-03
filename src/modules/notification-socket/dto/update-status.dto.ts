import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class NotificationUpdateStatus {
  @ApiProperty({
    required: true,
    description: 'Notification status',
  })
  @IsNotEmpty()
  @IsBoolean()
  notificationEnabled: boolean;
}
