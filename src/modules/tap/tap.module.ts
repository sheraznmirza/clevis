import { Module } from '@nestjs/common';
import { TapService } from './tap.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  providers: [TapService],
  exports: [TapService],
})
export class TapModule {}
