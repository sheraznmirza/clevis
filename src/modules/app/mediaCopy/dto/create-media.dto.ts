// import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength, IsEnum } from 'class-validator';
// import { MediaType } from "src/utilities/enums";

export class CreateMediaDto {
  // @ApiProperty()
  @IsNotEmpty()
  // @IsEnum(MediaType)
  // type: MediaType;

  // @ApiProperty()
  @IsNotEmpty()
  path: string;
}
