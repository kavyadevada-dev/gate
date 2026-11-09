import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
/**
 * Request DTO for resending an OTP.
 * The UID is received as a normal User ID from the client.
 * The backend encrypts it using SQL Server's
 * ENCRYPTBYPASSPHRASE('KTS', ...) before calling the
 * stored procedure.
 */
export class ResendOtpDto {
  /**
   * User ID for whom the OTP needs to be resent.
   */
  @IsNotEmpty()
  @IsString()
  uid!: string;
  /**
   * OTP flow/type.
   * Defaults to 'UR' in the service when this field
   * is not provided by the client.
   */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  otpType?: string;
  /**
   * Mobile number or email associated with the OTP.
   */
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  identifier!: string;
}