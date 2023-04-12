import { Body, Controller, HttpCode, Post } from '@nestjs/common/decorators';
import { AuthService } from './auth.service';
import { HttpStatus } from '@nestjs/common';
import {
  RiderSignUpDto,
  VendorSignUpDto,
  LoginDto,
  CustomerSignUpDto,
  RefreshDto,
  VerifyEmailDto,
} from './dto';
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

  @Post('/refresh')
  refreshTokens(@Body() refreshToken: RefreshDto) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('/forgot-password')
  forgotPassword(@Body() data: VerifyEmailDto) {
    return this.authService.forgotPassword(data);
  }

  // @Post('/logout')
  // logout() {
  //   this.authService.logout();
  // }
}
