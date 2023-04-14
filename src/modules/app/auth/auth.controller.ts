import {
  UseGuards,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common/decorators';
import { AuthService } from './auth.service';
import { HttpStatus } from '@nestjs/common';
import {
  RiderSignUpDto,
  VendorSignUpDto,
  LoginDto,
  CustomerSignUpDto,
  RefreshDto,
  ForgotPasswordDto,
} from './dto';
import { JwtRefreshGuard } from './guard';

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

  @HttpCode(HttpStatus.OK)
  @Post('rider/login')
  signinRider(@Body() dto: LoginDto) {
    return this.authService.signinRider(dto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('/refresh')
  refreshTokens(@Body() refreshToken: RefreshDto) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('/forgot-password')
  forgotPassword(@Body() data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Get('/verify-email/:id')
  verifyEmail(@Param('id') id: string) {
    return this.authService.verifyEmail(id);
  }

  // @Post('/logout')
  // logout() {
  //   this.authService.logout();
  // }
}
