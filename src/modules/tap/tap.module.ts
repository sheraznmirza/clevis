import { Module } from '@nestjs/common';
import { TapService } from './tap.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [TapService],
})
export class TapModule {}
