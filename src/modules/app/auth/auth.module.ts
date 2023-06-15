import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshStrategy, JwtStrategy } from './strategy';
import { TapModule } from 'src/modules/tap/tap.module';
import { MailModule } from 'src/modules/mail/mail.module';

@Module({
  imports: [JwtModule.register({}), TapModule, MailModule],
  controllers: [AuthController],
  exports: [AuthService],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
