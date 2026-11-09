// Import validation decorators from class-validator.
import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsIn,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
// Converts string form-data values into numbers where required.
import { Type } from 'class-transformer';
// DTO defines the fields accepted from the Add Pet form.
// The uploaded picture's actual file is handled by the controller.
// This DTO receives the saved picture path in petpicture.
export class AddPetDto {
  // Pet type ID must be a positive integer.
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pettype!: number;
  // Breed ID must be a positive integer.
  @Type(() => Number)
  @IsInt()
  @Min(1)
  breedtype!: number;
  // Pet name is required and limited to 200 characters.
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  petname!: string;
  // Pet colour is required and limited to 100 characters.
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  petcolour!: string;
  // This contains the saved file path, not the raw image bytes.
  @IsString()
  @IsNotEmpty()
  petpicture!: string;
  // Accept only the vaccination status values agreed with the SP.
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @IsIn(['V', 'YES', 'NO'])
  petvaccinationstatus!: string;
  // Require a valid ISO date string.
  // The service/controller should also ensure the date is not in the future.
  @IsDateString()
  @IsNotEmpty()
  petvaccinationdate!: string;
}