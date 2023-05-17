import { Controller, Param, UseGuards, Delete } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from '../../../core/guards';
import { Authorized } from '../../../core/decorators';
import { ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
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
