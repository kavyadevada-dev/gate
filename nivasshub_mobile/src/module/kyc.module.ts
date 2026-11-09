import { Module } from '@nestjs/common';
import { KycController } from '../controllers/kyc.controller';
import { KycRepository } from '../repositories/kyc.repository';
import { KycService } from '../Service/kyc.service';
@Module({
  controllers: [KycController],
  providers: [
    KycService,
    KycRepository,
  ],
})
export class KycModule {}