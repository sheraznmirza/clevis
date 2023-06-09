import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../../../modules/mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshStrategy, JwtStrategy } from './strategy';
import { TapModule } from 'src/modules/tap/tap.module';

@Module({
  imports: [JwtModule.register({}), MailModule, TapModule],
  controllers: [AuthController],
  exports: [AuthService],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
