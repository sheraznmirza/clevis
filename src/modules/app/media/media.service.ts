import { Injectable } from '@nestjs/common';
import { successResponse } from 'src/helpers/response.helper';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async deleteMedia(id: number) {
    try {
      await this.prisma.media.update({
        where: {
          id: id,
        },
        data: {
          isDeleted: true,
        },
      });

      successResponse(200, 'Media deleted successfully.');
    } catch (error) {
      throw error;
    }
  }
}
