import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEmail,
  MaxLength,
  IsNumber,
  IsIn
} from 'class-validator';
/**
 * Request fields accepted by the pre-registration
 * email/mobile availability check endpoint.
 * Business validation is handled by the stored procedure
 * so that the API returns the defined response codes.
 */
export class RegistrationCheckDto {
  @IsOptional()
  @IsString()
  @MaxLength(320)
  umail?: string;
  @IsOptional()
  @IsString()
  @MaxLength(25)
   cont_code?: string;
}
/**
 * Request fields accepted by the user registration endpoint.
 * Business validation is handled by the stored procedure
 * so that the API returns the defined response codes.
 */
export class UserRegistrationDto {
  @IsString()
  @IsNotEmpty()
  fname: string;
  @IsString()
  @IsNotEmpty()
  mobilenumber: string;
  @IsString()
  @IsNotEmpty()
  mob_cont_code: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  country: string;
  @IsString()
  @IsNotEmpty()
  state: string;
  @IsString()
  @IsNotEmpty()
  city: string;
  @IsNumber()
  socid: number;
  @IsNumber()
  towerid: number;
  @IsNumber()
  floorid: number;
  @IsNumber()
  unitnumber: number;
  @IsNumber()
  user_role: number;
  @IsOptional()
  @IsString()
  unit_branch?: string;
  @IsNumber()
  sub_role: number;
  @IsOptional()
  @IsNumber()
  sub_role_cat?: number;
}

export class VerifyRegistrationOtpDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  otp: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['M', 'E'])
  identifier: string;
}