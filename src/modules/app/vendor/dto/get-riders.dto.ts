import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ListingParams, OrderOf } from 'src/core/dto';

export class GetRiderListing extends ListingParams {
  @ApiProperty({
    required: false,
    enum: OrderOf,
    description: 'Order of the respective column in a table',
  })
  @IsOptional()
  @IsEnum(OrderOf)
  orderBy?: OrderOf;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsDateString()
  // currentDay: string;
}
