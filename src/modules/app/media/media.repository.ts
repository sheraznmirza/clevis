import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateManyMediasDto, CreateMediaDto, UpdateMediaDto } from './dto';

@Injectable()
export class MediaRepository {
  constructor(private prisma: PrismaService) {}

  async create(createMediaDto: CreateMediaDto) {
    try {
      const data = await this.prisma.media.create({
        data: {
          path: createMediaDto.path,
          type: createMediaDto.type,
          fileName: createMediaDto.fileName,
          originalName: createMediaDto.originalName,
          encoding: createMediaDto.encoding,
          size: createMediaDto.size,
        },
        select: {
          id: true,
          path: true,
          type: true,
        },
      });
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createMany(dto: CreateManyMediasDto) {
    // dto.files.
    try {
      const data = await this.prisma.media.createMany({
        data: dto.files,
      });
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
