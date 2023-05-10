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
  ResetPasswordDataDto,
  ChangePasswordDto,
  VerifyOtpDto,
  LogoutDto,
} from './dto';
import { JwtGuard, JwtRefreshGuard } from './guard';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from './decorator';
import { Authorized } from 'src/core/decorators';
import { UserType } from '@prisma/client';
import { RolesGuard } from 'src/core/guards';

@ApiTags('Auth')
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
  @Post('admin/login')
  signinAdmin(@Body() dto: LoginDto) {
    return this.authService.signinAdmin(dto);
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

  @HttpCode(HttpStatus.OK)
  @Post('/forgot-password')
  forgotPassword(@Body() data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Post('/reset-password')
  resetPassword(@Body() data: ResetPasswordDataDto) {
    return this.authService.resetPassword(data);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Get('/verify-email/:id')
  verifyEmail(@Param('id') id: string) {
    return this.authService.verifyEmail(id);
  }

  @UseGuards(JwtGuard)
  @Authorized([
    UserType.ADMIN,
    UserType.CUSTOMER,
    UserType.RIDER,
    UserType.VENDOR,
  ])
  @HttpCode(HttpStatus.OK)
  @Post('/change-password')
  changePassword(@Body() dto: ChangePasswordDto, @GetUser() user) {
    return this.authService.changePassword(dto, user.userMasterId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Authorized([
    UserType.ADMIN,
    UserType.CUSTOMER,
    UserType.RIDER,
    UserType.VENDOR,
  ])
  @Post('/logout')
  logout(@Body() dto: LogoutDto) {
    this.authService.logout(dto);
  }
}
