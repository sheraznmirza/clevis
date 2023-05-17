import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { IsString } from 'class-validator';
export class SendMobileNotificationDto {
  @ApiProperty({
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'minmum 8 charactors required for the message' })
  @MaxLength(200, { message: 'Can send maximum 200 charactors per message' })
  message: string;
  z;
  @ApiProperty({
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'minmum 8 charactors required for the message' })
  @MaxLength(200, { message: 'Can send maximum 200 charactors per message' })
  subject: string;

  @ValidateIf((o) => o.class_id == undefined && o.user_ids == undefined)
  @ApiProperty({
    required: false,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'please provide a valid data of Course' })
  course_id?: number;

  @ValidateIf((o) => o.course_id == undefined && o.user_ids == undefined)
  @Transform(
    ({ value }) =>
      () =>
        Number(value),
  )
  @ApiProperty({
    required: false,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'please provide a valid data of Class' })
  class_id?: number;

  //@Transform(({ value }) => toNumber(value))

  @ValidateIf((o) => o.class_id == undefined && o.course_id == undefined)
  @ApiProperty({
    required: false,
    type: 'number',
  })
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  user_ids?: number[];
}
