import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

enum OrderOf {
  asc = 'asc',
  desc = 'desc',
}

enum CustomerColumns {
  fullName = 'fullName',
  phone = 'phone',
  email = 'email',
  fullAddress = 'fullAddress',
  createdAt = 'createdAt',
  companyName = 'companyName',
}

enum ColumnName {
  fullName = 'fullName',
  phone = 'phone',
  email = 'email',
  fullAddress = 'fullAddress',
  createdAt = 'createdAt',
  companyName = 'companyName',
}
export class ListingParams {
  @ApiProperty({
    required: false,
    description: 'Listing parameters Page Number',
  })
  @IsOptional()
  page?: number;

  @ApiProperty({
    required: false,
    description: 'Listing parameters Per Page Limit',
  })
  @IsOptional()
  take?: number;

  @ApiProperty({
    required: false,
    description: 'Search by name, title or code',
  })
  @IsOptional()
  search?: string;
}

export class CustomerListingParams extends ListingParams {
  @ApiProperty({
    required: false,
    description: 'Order of the respective column in a table',
  })
  @IsOptional()
  @IsEnum(OrderOf)
  order?: OrderOf;

  @ApiProperty({
    required: false,
    description: 'Select the respective column you want to order',
  })
  @IsOptional()
  @IsEnum(CustomerColumns)
  columnName?: CustomerColumns;
}

export class VendorListingParams extends ListingParams {
  @ApiProperty({
    required: false,
    description: 'Enum for status of the vendor',
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiProperty({
    required: false,
    description: 'Select the respective column you want to order',
  })
  @IsOptional()
  @IsEnum(CustomerColumns)
  columnName?: CustomerColumns;
}
