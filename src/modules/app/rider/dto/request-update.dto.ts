import { IsArray, IsEmail, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MediaFormat } from 'src/core/globalTypes';
import { Type } from 'class-transformer';

export class UpdateRequestDto {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  companyEmail: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  companyName: string;

  @ApiProperty({
    isArray: true,
    type: MediaFormat,
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaFormat)
  businessLicense: MediaFormat[];
}
