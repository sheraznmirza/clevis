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
      const data = this.prisma.media.create({
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
      console.log('data: ', data);
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
