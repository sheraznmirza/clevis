import { Module } from '@nestjs/common';

import { PlatformSetupService } from './platform-setup.service';
import { PlatformSetupController } from './platform-setup.controller';

@Module({
  providers: [PlatformSetupService],
  controllers: [PlatformSetupController],
})
export class PlatformModule {}
