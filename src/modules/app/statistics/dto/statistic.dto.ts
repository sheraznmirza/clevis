import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { YearlyFilterDropdownType } from 'src/core/dto';

export class StatisticVendorAdminQueryDto {
  @ApiProperty({
    required: false,
    description: 'Select the respective tab you want to get Record',
    enum: YearlyFilterDropdownType,
  })
  @IsNotEmpty()
  @IsEnum(YearlyFilterDropdownType)
  tabName: YearlyFilterDropdownType;

  // @ApiProperty()
  // // @IsNotEmpty()
  // @IsOptional()
  // @IsString()
  // date?: string;
}
