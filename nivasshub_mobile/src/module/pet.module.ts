import { Module } from '@nestjs/common';
import { PetController } from '../controllers/pet.controller';
import { PetRepository } from '../repositories/pet.repository';
import { PetService } from '../Service/pet.service';
/**
 * Groups the controller, service, and repository
 * required for the Add Pet reference-data API.
 */
@Module({
  controllers: [PetController],
  providers: [PetService, PetRepository],
})
export class PetModule {}
