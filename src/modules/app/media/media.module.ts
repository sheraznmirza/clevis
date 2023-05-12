import { Module } from '@nestjs/common';
// import DatabaseModule from 'src/database/database.module';
// import MediaController from './media.controller';
import { MediaController } from './media.controller';
import MediaService from './media.service';
// import S3Service from './s3.service';

@Module({
  //   imports: [DatabaseModule],
  exports: [MediaService],
  providers: [MediaService],
  controllers: [MediaController],
})
export default class MediaModule {}
