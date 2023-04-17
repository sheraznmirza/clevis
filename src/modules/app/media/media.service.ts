import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { UpdateMediaDto } from './dto/update-media.dto';
import { CreateMediaDto } from './dto/create-media.dto';
// import { Media } from './entities/media.entity';
// import { errorApiWrapper } from 'src/utilities/responses/wrapper.service';
import { MediaRepository } from './media.repository';
// import { checkIfFileExistsInDir } from 'src/helpers/file.helper';

@Injectable()
export class MediaService {
  constructor(private mediaRepository: MediaRepository) {}

  async uploadFile(createMediaDto: CreateMediaDto) {
    try {
      console.log('createMediaDto: ', createMediaDto);
      const data = this.mediaRepository.create(createMediaDto);
      // data = await this.mediaRepository.save(data);
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
