import { Injectable } from '@nestjs/common';
import { ERROR_MESSAGE } from 'src/core/constants';
import { successResponse, unknowError } from 'src/helpers/response.helper';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async deleteMedia(id: number) {
    try {
      const result = await this.prisma.media.update({
        where: {
          id: id,
        },
        data: {
          isDeleted: true,
        },
      });
      if (!result) {
        throw unknowError(404, {}, '');
      } else {
        return successResponse(200, 'Media deleted successfully.');
      }
    } catch (error) {
      throw unknowError(417, error, ERROR_MESSAGE.MSG_417);
    }
  }
}
