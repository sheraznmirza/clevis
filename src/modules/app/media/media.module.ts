import { Module, Global } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaRepository } from './media.repository';

@Global()
@Module({
  providers: [MediaService, MediaRepository],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
