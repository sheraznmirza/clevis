import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ListingParams } from 'src/core/dto';

export class VendorServiceParams extends ListingParams {
  @ApiProperty({
    required: false,
    description:
      'Send vendorServiceId to get the respective categories in the vendor service',
  })
  @IsString()
  @IsOptional()
  vendorServiceId?: string;

  @ApiProperty({
    required: false,
    description:
      'Send category ID to get the respective subcategories in the vendor service',
  })
  @IsString()
  @IsOptional()
  categoryId?: string;
}

export class VendorServiceCarWashParams extends ListingParams {
  @ApiProperty({
    required: false,
    description:
      'Send category ID to get the respective subcategories in the vendor service',
  })
  @IsString()
  @IsOptional()
  categoryId?: string;
}
