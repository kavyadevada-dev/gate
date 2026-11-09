import { Module } from '@nestjs/common';
import { SocietyController } from '../controllers/society.controller';
import { SocietyRepository } from '../repositories/society.repository';
import { SocietyService } from '../Service/society.service';
/**
 * Society feature module.
 * This module groups all components required for
 * the Society Details API.
 */
@Module({
  // Controllers expose the Society HTTP endpoints.
  controllers: [SocietyController],
  // Providers contain the service and repository used
  // by the Society feature.
  providers: [
    SocietyService,
    SocietyRepository,
  ],
})
export class SocietyModule {}