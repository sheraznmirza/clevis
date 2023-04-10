import {
  Body,
  Controller,
  HttpCode,
  Post,
  Get,
} from '@nestjs/common/decorators';
import { AuthService } from './auth.service';
import { CustomerSignUpDto } from './dto';
import { HttpStatus } from '@nestjs/common';
import { VendorSignUpDto } from './dto/vendor-signup.dto';
import { LoginDto } from './dto/login.dto';
import { RiderSignUpDto } from './dto/rider-signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('customer/signup')
  signupCustomer(@Body() dto: CustomerSignUpDto) {
    return this.authService.signupAsCustomer(dto);
  }

  @Post('vendor/signup')
  signupVendor(@Body() dto: VendorSignUpDto) {
    return this.authService.signupAsVendor(dto);
  }

  @Post('rider/signup')
  signupAsRider(@Body() dto: RiderSignUpDto) {
    return this.authService.signupAsRider(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('customer/login')
  signinCustomer(@Body() dto: LoginDto) {
    return this.authService.signinCustomer(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('vendor/login')
  signinVendor(@Body() dto: LoginDto) {
    return this.authService.signinVendor(dto);
  }

  // @HttpCode(HttpStatus.OK)
  // @Post('forgot/password')
  // forgotPassword(@Body() dto: { email: string }) {
  //   return this.authService.forgotPassword(dto);
  // }

  // @Get('/refresh')
  // refreshTokens(@Body() rt: string) {
  //   this.authService.refreshTokens(rt);
  // }

  // @Post('/logout')
  // logout() {
  //   this.authService.logout();
  // }
}
