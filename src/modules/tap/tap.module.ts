import { Module, Global } from '@nestjs/common';
import { TapService } from './tap.service';
import { HttpModule } from '@nestjs/axios';
import { TapController } from './tap.controller';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [TapController],
  providers: [TapService],
  exports: [TapService],
})
export class TapModule {}
