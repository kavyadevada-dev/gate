import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
/**
 * Validates the request body for registering a vehicle.
 * IP address and device information are derived from the HTTP request.
 */
export class AddVehicleDto {
  @IsString()
  @IsNotEmpty()
  user_token: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  vehicletype: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  vehicleregistrationnumber: string;
  @IsInt()
  @Min(1)
  vehiclebrandid: number;
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  vehiclemodel: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  vehicle_colour: string;
  @IsInt()
  @Min(1)
  parkingzoneid: number;
}