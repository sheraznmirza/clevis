import { Module, Global } from '@nestjs/common';
import { TapService } from './tap.service';
import { HttpModule } from '@nestjs/axios';

@Global()
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
