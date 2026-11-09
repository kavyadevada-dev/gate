import { Module } from '@nestjs/common';
import { AddFamilyController } from '../controllers/family.controller';
import { AddFamilyService } from '../Service/family.service';
import { AddFamilyRepository } from '../repositories/family.repository';

@Module({
  controllers: [AddFamilyController],
  providers: [AddFamilyService, AddFamilyRepository],
  exports: [AddFamilyService],
})
export class AddFamilyModule {}