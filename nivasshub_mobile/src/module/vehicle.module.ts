import { Module } from '@nestjs/common';
import { VehicleController } from '../controllers/vehicle.controller';
import { VehicleService } from '../Service/vehicle.service';
import { VehicleRepository } from '../repositories/vehicle.repository';
/**
 * VehicleModule registers the vehicle master-data API
 * and its controller, service, and repository dependencies.
 */
@Module({
  controllers: [VehicleController],
  providers: [
    VehicleService,
    VehicleRepository,
  ],
})
export class VehicleModule {}
