// import { Body } from '@nestjs/common';
// // import { User } from '@prisma/client';
// import {
//   ApiController,
//   Authorized,
//   CurrentUser,
//   Post,
// } from 'src/core/decorators';
// import {
//   UploadFinalizeMediaRequestDTO,
//   UploadInitiateMediaRequestDTO,
// } from './dto/request/upload.request';
// import {
//   UploadFinalizeMediaResponseDTO,
//   UploadInitiateMediaResponseDTO,
// } from './dto/response/upload.response';
// import MediaService from './media.service';

// @ApiController({
//   path: '/media',
//   tag: 'media',
//   version: '1',
// })
// export default class MediaController {
//   constructor(private _mediaService: MediaService) {}

//   @Post({
//     path: '/public/init',
//     description: 'Upload public media',
//     response: UploadInitiateMediaResponseDTO,
//   })
//   UploadPublicInitiate(
//     @Body() data: UploadInitiateMediaRequestDTO,
//   ): Promise<UploadInitiateMediaResponseDTO> {
//     return this._mediaService.UploadInitiate(data);
//   }

//   @Post({
//     path: '/public/finalize',
//     description: 'Finalize public media',
//     response: UploadFinalizeMediaResponseDTO,
//   })
//   UploadPublicFinalize(
//     @Body() data: UploadFinalizeMediaRequestDTO,
//   ): Promise<UploadFinalizeMediaResponseDTO> {
//     return this._mediaService.UploadFinalize(data);
//   }

//   @Authorized()
//   @Post({
//     path: '/init',
//     description: 'Upload media',
//     response: UploadInitiateMediaResponseDTO,
//   })
//   UploadInitiate(
//     @Body() data: UploadInitiateMediaRequestDTO,
//     @CurrentUser() user: User,
//   ): Promise<UploadInitiateMediaResponseDTO> {
//     return this._mediaService.UploadInitiate(data, user);
//   }

//   @Authorized()
//   @Post({
//     path: '/finalize',
//     description: 'Finalize media',
//     response: UploadFinalizeMediaResponseDTO,
//   })
//   UploadFinalize(
//     @Body() data: UploadFinalizeMediaRequestDTO,
//     @CurrentUser() user: User,
//   ): Promise<UploadFinalizeMediaResponseDTO> {
//     return this._mediaService.UploadFinalize(data, user);
//   }
// }

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import { UserType } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from '../../../core/guards';
import { Authorized } from '../../../core/decorators';
import { ApiTags } from '@nestjs/swagger';
//   import {
//     UpdateVendorDto,
//     VendorCreateServiceDto,
//     VendorUpdateStatusDto,
//   } from './dto';
//   import { VendorService } from './vendor.service';

//   import {
//     ListingParams,
//     VendorListingParams,
//     VendorRiderByIdParams,
//   } from 'src/core/dto';
import MediaService from './media.service';
@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}
  @Authorized([
    UserType.ADMIN,
    UserType.CUSTOMER,
    UserType.RIDER,
    UserType.VENDOR,
  ])
  @Delete('/:mediaId')
  deleteMedia(@Param('mediaId') mediaId: number) {
    return this.mediaService.deleteMedia(mediaId);
  }
}
