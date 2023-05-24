import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ListingParams } from 'src/core/dto';

export class VendorServiceParams extends ListingParams {
  @ApiProperty({
    required: false,
    description:
      'Set service as true to get the respective categories in the vendor service',
  })
  @IsString()
  @IsOptional()
  service?: string;

  @ApiProperty({
    required: false,
    description:
      'Set category as true to get the respective subcategories in the vendor service',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    required: false,
    description:
      'Set category as true to get the respective subcategories in the vendor service',
  })
  @IsString()
  @IsOptional()
  subcategory?: string;
}
