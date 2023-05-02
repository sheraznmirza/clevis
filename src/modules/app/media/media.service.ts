import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediaRepository } from './media.repository';
import { CreateManyMediasDto } from './dto';

@Injectable()
export class MediaService {
  constructor(private mediaRepository: MediaRepository) {}

  async uploadFile(createMediaDto: CreateMediaDto) {
    try {
      console.log('createMediaDto: ', createMediaDto);
      const data = this.mediaRepository.create(createMediaDto);
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async uploadManyFiles(dto: CreateManyMediasDto) {
    console.log('dto: ', dto);
    try {
      await this.mediaRepository.createMany(dto);
      const data = [];
      for (let i = 0; i < dto.files.length; i++) {
        const temp = await this.mediaRepository.findOne(dto.files[i].path);
        data.push(temp);
      }
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // async checkIfMediaExists(media_id: number): Promise<Media> {
  //   const data = await this.mediaRepository.findOne(media_id);
  //   if (!data) {
  //     throw new BadRequestException(
  //       errorApiWrapper(`Media ${media_id} not found `, HttpStatus.NOT_FOUND),
  //     );
  //   }
  //   if (!(await checkIfFileExistsInDir(data.path))) {
  //     throw new BadRequestException(
  //       errorApiWrapper(
  //         `Media ${media_id} not found in file directory`,
  //         HttpStatus.NOT_FOUND,
  //       ),
  //     );
  //   }
  //   return data;
  // }
}
