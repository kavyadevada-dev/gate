
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
} from 'class-validator';
/**
 * DTO used to receive the society ID from the GET request.
 * Example:
 * GET /society/details?socid=33
 * Query parameters are received as strings by default,
 * so socid is intentionally defined as a string here.
 * The actual numeric validation is handled before calling
 * the stored procedure so that invalid values do not cause
 * a SQL conversion error.
 */
export class SocietyDetailsDto {
  @IsNotEmpty()
  @IsString()
  socid!: string;
}
/**
 * DTO used to receive the user's session token
 * for the Add Society master data API.
 * Example:
 * GET /society/add-master-data?user_token=YOUR_SESSION_TOKEN
 */
export class AddSocietyMasterDataDto {
  @IsNotEmpty()
  @IsString()
  user_token!: string;
}
/** Validates input for adding a user to a society unit. */
export class AddUserToSocietyDto {
  @IsString()
  @IsNotEmpty()
  user_token: string; // User session or refresh token
  @IsNumber()
  cont_code: number; // Country ID
  @IsNumber()
  state_code: number; // State ID
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string; // City name
  @IsNumber()
  soc_id: number; // Society ID
  @IsNumber()
  tower_id: number; // Tower ID
  @IsNumber()
  floor: number; // Floor ID
  @IsNumber()
  unitid: number; // Unit/flat ID
  @IsNumber()
  user_type: number; // User role ID
  @IsOptional()
  @IsNumber()
  user_sub_role?: number; // Optional sub-role
  @IsOptional()
  @IsNumber()
  user_cat?: number; // Optional user category
  @IsNumber()
  documentid: number; // KYC document ID
}
