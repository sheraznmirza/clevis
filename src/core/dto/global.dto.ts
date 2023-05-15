import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceType, Status } from '@prisma/client';

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

enum VendorColumns {
  fullName = 'fullName',
  phone = 'phone',
  email = 'email',
  fullAddress = 'fullAddress',
  createdAt = 'createdAt',
  companyName = 'companyName',
}

export enum RiderVendorTabs {
  PROFILE = 'PROFILE',
  COMPANY_PROFILE = 'COMPANY_PROFILE',
  COMPANY_SCHEDULE = 'COMPANY_SCHEDULE',
  ACCOUNT_DETAILS = 'ACCOUNT_DETAILS',
}
export class ListingParams {
  @ApiProperty({
    required: false,
    description: 'Listing parameters Page Number',
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({
    required: false,
    description: 'Listing parameters Per Page Limit',
  })
  @IsOptional()
  @IsString()
  take?: string;

  @ApiProperty({
    required: false,
    description: 'Search by name, title or code',
  })
  @IsOptional()
  @IsString()
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
    enum: CustomerColumns,
  })
  @IsOptional()
  @IsEnum(CustomerColumns)
  columnName?: CustomerColumns;
}

export class VendorListingParams extends ListingParams {
  @ApiProperty({
    required: false,
    description: 'Enum for status of the vendor',
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiProperty({
    required: false,
    description: 'Enum for service type of the vendor',
    enum: ServiceType,
  })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @ApiProperty({
    required: false,
    description: 'Select the respective column you want to order',
    enum: VendorColumns,
  })
  @IsOptional()
  @IsEnum(VendorColumns)
  columnName?: VendorColumns;
}

export class RiderListingParams extends ListingParams {
  @ApiProperty({
    required: false,
    description: 'Enum for status of the vendor',
    enum: Status,
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiProperty({
    required: false,
    description: 'Select the respective column you want to order',
    enum: VendorColumns,
  })
  @IsOptional()
  @IsEnum(VendorColumns)
  columnName?: VendorColumns;
}

export class VendorRiderByIdParams {
  @ApiProperty({
    required: false,
    description: 'Select the respective tab you want to order',
    enum: RiderVendorTabs,
  })
  @IsOptional()
  @IsEnum(RiderVendorTabs)
  tabName: RiderVendorTabs;
}

export class CustomerVendorListingParams extends ListingParams {
  @ApiProperty({
    required: false,
    description: 'The longitude',
  })
  @IsString()
  @IsOptional()
  longitude: number;

  @ApiProperty({
    required: false,
    description: 'The latitude',
  })
  @IsString()
  @IsOptional()
  latitude: number;

  @ApiProperty({
    required: false,
    description: 'The distance radius',
  })
  @IsString()
  @IsOptional()
  distance: number;

  @ApiProperty({
    required: false,
    description: 'Select the respective service type.',
    enum: ServiceType,
  })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType: ServiceType;
}
export class ServiceCategorySubCategoryListingParams extends ListingParams {
  @ApiProperty({
    required: false,
    description: 'Select the respective service type you want to order',
    enum: ServiceType,
  })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType: ServiceType;
}
