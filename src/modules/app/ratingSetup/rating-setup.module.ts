import { Module } from '@nestjs/common';
import { RatingSetupService } from './rating-setup.service';
import { RatingSetupController } from './rating-setup.controller';
// import { RatingSetupService } from './rating-setup.service';
// import { RatingSetupController } from './rating-setup.controller';

@Module({
  providers: [RatingSetupService],
  controllers: [RatingSetupController],
})
export class RatingModule {}
