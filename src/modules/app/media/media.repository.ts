import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateManyMediasDto, CreateMediaDto } from './dto';

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
          originalName: true,
        },
      });
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createMany(dto: CreateManyMediasDto) {
    try {
      const data = await this.prisma.media.createMany({
        data: dto.files,
      });
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(path: string) {
    try {
      const data = await this.prisma.media.findUnique({
        where: {
          path,
        },
        select: {
          id: true,
          path: true,
          type: true,
          originalName: true,
        },
      });

      return data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
