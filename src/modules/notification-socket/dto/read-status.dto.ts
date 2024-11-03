import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NotificationUpdateParams {
  @ApiProperty({
    required: true,
    description: 'NotificationId',
  })
  @IsNotEmpty()
  @IsString()
  notificationId: string;
}
