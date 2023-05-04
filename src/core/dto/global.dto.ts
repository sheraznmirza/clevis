import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
