import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ServiceUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceName?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;
}
