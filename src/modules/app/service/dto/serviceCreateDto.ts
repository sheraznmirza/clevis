import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ServiceCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @ApiProperty({
    enum: ServiceType,
  })
  @IsEnum(ServiceType)
  @IsNotEmpty()
  serviceType: ServiceType;
}
