import { Module, Global } from '@nestjs/common';
import { TapService } from './tap.service';
import { HttpModule } from '@nestjs/axios';
import { TapController } from './tap.controller';
import { MailModule } from '../mail/mail.module';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    MailModule,
  ],
  controllers: [TapController],
  providers: [TapService],
  exports: [TapService],
})
export class TapModule {}
