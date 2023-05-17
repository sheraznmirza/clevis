import { Module } from '@nestjs/common';
// import DatabaseModule from 'src/database/database.module';
// import MediaController from './media.controller';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
@Module({
  //   imports: [DatabaseModule],
  exports: [MediaService],
  providers: [MediaService],
  controllers: [MediaController],
})
export default class MediaModule {}
