// import { ApiProperty } from "@nestjs/swagger";
import { MediaType } from '@prisma/client';
import { IsArray } from 'class-validator';

type createMedia = {
  type: MediaType;
  path: string;
  encoding: string;
  fileName: string;
  originalName: string;
  size: number;
};

export class CreateManyMediasDto {
  // @ApiProperty()
  @IsArray()
  files: createMedia[];
}
