import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '@prisma/client';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ListingParams } from 'src/core/dto';

export class VendorEarning extends ListingParams {
  @ApiProperty({
    required: false,
    description: 'Listing parameters Page Number',
  })
  @IsOptional()
  @IsString()
  serviceType?: ServiceType;

  @ApiProperty({
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiProperty({
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dateTill?: string;
}
