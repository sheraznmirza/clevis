import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { YearlyFilterDropdownType } from 'src/core/dto';

export class StatisticVendorAdminQueryDto {
  @ApiProperty({
    required: false,
    description: 'Select the respective tab you want to get Record',
    enum: YearlyFilterDropdownType,
  })
  @IsOptional()
  @IsEnum(YearlyFilterDropdownType)
  tabName: YearlyFilterDropdownType;

  @ApiProperty({
    required: false,
    description: 'Select the respective tab you want to Type',
    enum: UserType,
  })
  @IsOptional()
  @IsEnum(UserType)
  Usertype: UserType;
}
