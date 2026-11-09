import { Module } from '@nestjs/common';
import { OtpController } from '../controllers/otp.controller';
import { OtpRepository } from '../repositories/otp.repository';
import { OtpService } from '../Service/otp.service';
@Module({
  controllers: [OtpController],
  providers: [
    OtpService,
    OtpRepository,
  ],
})
export class OtpModule {}