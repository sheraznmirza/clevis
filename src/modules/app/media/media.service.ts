import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaAccess, MediaStatus, MediaType, User } from '@prisma/client';
import AppConfig from 'src/configs/app.config';
// import {
//   BadRequestException,
//   ForbiddenException,
//   NotFoundException,
// } from 'core/exceptions/response.exception';
import DatabaseService from 'src/database/database.service';
import { Logger } from 'src/helpers/logger.helper';
import {
  UploadFinalizeMediaRequestDTO,
  UploadInitiateMediaRequestDTO,
} from './dto/request/upload.request';
import {
  UploadFinalizeMediaResponseDTO,
  UploadInitiateMediaResponseDTO,
} from './dto/response/upload.response';
import S3Service from './s3.service';

@Injectable()
export default class MediaService {
  constructor(
    private _dbService: DatabaseService,
    private _s3Service: S3Service,
  ) {}

  private _allowedMediaExtensions = {
    [MediaType.IMAGE]: ['png', 'jpg', 'bmp', 'jpeg', 'gif'],
    [MediaType.VIDEO]: ['mov', 'wav', 'mp4', 'avi', 'flv', 'wav', 'mov'],
    [MediaType.DOCUMENT]: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
    [MediaType.ARCHIVE]: ['zip', 'gzip'],
    [MediaType.OTHER]: [],
  };

  private _allowedMediaSize = {
    [MediaType.IMAGE]: 5 * 1024, // 20kb
    [MediaType.VIDEO]: 5 * 1024 * 1024, // 5gb
    [MediaType.DOCUMENT]: 100 * 1024, // 100mb
    [MediaType.ARCHIVE]: 1 * 1024 * 1024, // 1gb
    [MediaType.OTHER]: 0,
  };

  private _getMediaExtension(fileName: string) {
    return fileName
      .slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2)
      .toLowerCase();
  }

  async UploadInitiate(
    data: UploadInitiateMediaRequestDTO,
    user?: User,
  ): Promise<UploadInitiateMediaResponseDTO> {
    const extension = this._getMediaExtension(data.name);
    if (!this._allowedMediaExtensions[data.type].includes(extension)) {
      throw new BadRequestException('media.not_supported');
    }

    const sizeAllowed = data.size <= this._allowedMediaSize[data.type];
    if (!sizeAllowed) {
      throw new BadRequestException('media.too_large');
    }

    const location = `${AppConfig.AWS.BUCKET_BASE_URL}`;
    const path = this._s3Service.CreateUniqueFilePath(data.name, data.type);

    const media = await this._dbService.media.create({
      data: {
        name: data.name,
        extension,
        location,
        path,
        thumbPath: path,
        type: data.type,
        status: MediaStatus.UPLOADING,
        access: user ? MediaAccess.PRIVATE : MediaAccess.PUBLIC,
        userId: user ? user.id : null,
        size: data.size,
      },
    });

    const credentials = await this._s3Service.GetFileUploadPermissions(
      path,
      media.id,
    );

    return {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
      mediaId: media.id,
      bucket: AppConfig.AWS.BUCKET,
      bucketPath: location,
      mediaPath: path,
      location: `${location}${path}`,
      region: AppConfig.AWS.REGION,
    };
  }

  async UploadFinalize(
    data: UploadFinalizeMediaRequestDTO,
    user?: User,
  ): Promise<UploadFinalizeMediaResponseDTO> {
    const media = await this._dbService.media.findFirst({
      where: { id: data.id },
    });
    if (!media) {
      throw new NotFoundException('media.not_found');
    }

    if (
      media.access === MediaAccess.PRIVATE &&
      (!user || user.id !== media.userId)
    ) {
      throw new ForbiddenException('media.not_allowed');
    }
    Logger.Info(media, 'MEDIA');

    try {
      const s3Object = await this._s3Service.GetObjectHead(media.path);
      if (!s3Object) {
        throw new NotFoundException('media.not_found');
      }
      const sizeAllowed =
        s3Object.contentLength <= this._allowedMediaSize[media.type];
      if (!sizeAllowed) {
        throw new BadRequestException('media.too_large');
      }
    } catch (error) {
      Logger.Error(error);
    }

    if (media.access === MediaAccess.PUBLIC) {
      await this._s3Service.UpdateObjectAccess(media.path, 'public-read');
    }

    await this._dbService.media.update({
      where: { id: media.id },
      data: { status: MediaStatus.READY },
    });
    media.status = MediaStatus.READY;

    return media;
  }
}
