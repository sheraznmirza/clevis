import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { YearlyFilterDropdownType } from 'src/core/dto';

export class StatisticUserAdminQueryDto {
  @ApiProperty({
    required: false,
    description: 'Select the respective tab you want to get Record',
    enum: YearlyFilterDropdownType,
  })
  @IsOptional()
  @IsEnum(YearlyFilterDropdownType)
  tabName: YearlyFilterDropdownType;
}
