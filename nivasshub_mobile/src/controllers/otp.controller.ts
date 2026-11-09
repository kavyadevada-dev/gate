import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ResendOtpDto } from '../dto/otp.dto';
import { OtpService } from '../Service/otp.service';
@Controller('otp')
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
  ) {}
  /**
   * Resend OTP for an existing user.
   * Endpoint:
   * POST /otp/resend
   * The controller only receives the request and
   * delegates the operation to the service layer.
   */
  @Post('resend')
  @HttpCode(HttpStatus.OK)
  async resendOtp(
    @Body() dto: ResendOtpDto,
  ) {
    return this.otpService.resendOtp(dto);
  }
}