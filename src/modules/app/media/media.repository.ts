import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateMediaDto, UpdateMediaDto } from './dto';

@Injectable()
export class MediaRepository {
  constructor(private prisma: PrismaService) {}

  async create(createMediaDto: CreateMediaDto) {
    try {
      const data = await this.prisma.media.create({
        data: {
          path: createMediaDto.path,
          type: createMediaDto.type,
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

  async createMany(createMediaDto: CreateMediaDto) {
    try {
      const data = await this.prisma.media.createMany({
        data: [
          {
            path: createMediaDto.path,
            type: createMediaDto.type,
          },
        ],
      });
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
