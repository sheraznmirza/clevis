import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { Express } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { getFileData, storage } from 'src/helpers/file.helper';
import { successResponse } from 'src/helpers/response.helper';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Media')
@Controller('media')
// @ApiTags('Media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('file')
  // @ApiAuthPermission()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: storage }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const payload = getFileData(file);
    const data = await this.mediaService.uploadFile(await payload);
    return { ...successResponse(201, 'File successfully uploaded'), ...data };
  }

  @Post('files')
  // @ApiAuthPermission()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 20, { storage: storage }))
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    console.log('files: ', files);
    const mappedFiles = await Promise.all(
      files.map(async (file) => {
        return await getFileData(file);
      }),
    );

    console.log('mappedFiles: ', mappedFiles);
    return await this.mediaService.uploadManyFiles({ files: mappedFiles });
    // return await Promise.all(
    //   files.map(async (file) => {
    //     const payload = getFileData(file);
    //     const data = await this.mediaService.uploadManyFiles(await mappedFiles);
    //     return data;
    //   }),
    // );
  }
}
