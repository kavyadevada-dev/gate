import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { LoginService } from '../Service/login.service';
import {
  LoginDto,
  ForgetPasswordDto,
  ForgotPasswordResponseDto,
  ForgotPasswordVerifyOtpDto,
  UpdatePasswordDto,
} from '../dto/login.dto';
@Controller('auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}
  /** POST /auth/login derives network metadwata on the server. */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() credentials: LoginDto, @Req() request: FastifyRequest) {
    const ipadd = request.ip ?? request.socket.remoteAddress ?? '';
    const dinfo = this.getDeviceInfo(request);
    return this.loginService.login({
      umail: credentials.umail,
      pwd: credentials.pwd,
      cont_code: credentials.cont_code ?? null,
      ipadd,
      dinfo,
    });
  }
  /** Reads device information from trusted request metadata. */
  private getDeviceInfo(request: FastifyRequest): string {
    const deviceInfo =
      request.headers['x-device-info'] ?? request.headers['user-agent'];
    return Array.isArray(deviceInfo)
      ? (deviceInfo[0] ?? '')
      : (deviceInfo ?? '');
  }
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: ForgetPasswordDto,
  ): Promise<ForgotPasswordResponseDto> {
    return this.loginService.forgotPassword(dto);
  }

  @Post('forgot-password/verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyForgotPasswordOtp(@Body() body: ForgotPasswordVerifyOtpDto) {
    return this.loginService.verifyForgotPasswordOtp(body);
  }
  /**
 * POST /auth/forgot-password/update-password
 * Updates the user's password using the FP token
 * generated during forgot-password OTP verification.
 */
@Post('forgot-password/update-password')
@HttpCode(HttpStatus.OK)
async updatePassword(
  @Body() dto: UpdatePasswordDto,
) {
  // Pass the validated request body to the service.
  return this.loginService.updatePassword(dto);
}
}
