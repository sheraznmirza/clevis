// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   UploadedFile,
//   UseInterceptors,
//   UploadedFiles,
//   Req,
//   UseGuards,
// } from '@nestjs/common';
// // import { ApiConsumes, ApiBody, ApiTags } from "@nestjs/swagger";
// import { MediaService } from './media.service';
// import { Express } from 'express';
// import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
// import { getFileData, storage } from 'src/helpers/file.helper';

// // import { successApiWrapper } from '../utilities/responses/wrapper.service';
// // import { mediaSingleMapper } from './media.mapper';
// // import { SuccessApiInterface } from '../utilities/responses/wrapper.response';
// // import { ApiAuthPermission } from 'src/decorators/api-permissions.decorator';

// @Controller('media')
// // @ApiTags('Media')
// export class MediaController {
//   constructor(private readonly mediaService: MediaService) {}

//   @Post('file')
//   // @ApiAuthPermission()
//   // @ApiConsumes('multipart/form-data')
//   // @ApiBody({
//   //   schema: {
//   //     type: 'object',
//   //     properties: {
//   //       file: {
//   //         type: 'string',
//   //         format: 'binary',
//   //       },
//   //     },
//   //   },
//   // })
//   @UseInterceptors(FileInterceptor('file', { storage: storage }))
//   async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
//     const payload = getFileData(file);
//     const data = await this.mediaService.uploadFile(await payload);
//     // return successApiWrapper(mediaSingleMapper(data));
//   }

//   @Post('files')
//   // @ApiAuthPermission()
//   // @ApiConsumes('multipart/form-data')
//   // @ApiBody({
//   //   schema: {
//   //     type: 'object',
//   //     properties: {
//   //       files: {
//   //         type: 'array',
//   //         items: {
//   //           type: 'string',
//   //           format: 'binary',
//   //         },
//   //       },
//   //     },
//   //   },
//   // })
//   @UseInterceptors(FilesInterceptor('files', 20, { storage: storage }))
//   async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
//     return await Promise.all(
//       files.map(async (file) => {
//         const payload = getFileData(file);
//         const data = await this.mediaService.uploadFile(await payload);
//         // return successApiWrapper(mediaSingleMapper(data));
//         return data;
//       }),
//     );
//   }
// }
