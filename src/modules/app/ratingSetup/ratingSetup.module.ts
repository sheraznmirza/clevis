import { Module } from '@nestjs/common';
import { RatingSetupService } from './ratingsetup.service';
import { RatingSetupController } from './ratingSetup.controller';

@Module({
  providers: [RatingSetupService],
  controllers: [RatingSetupController],
})
export class RatingModule {}
