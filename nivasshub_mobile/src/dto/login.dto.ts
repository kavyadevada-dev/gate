import {
  Allow,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
/** Validated body fields accepted by the login endpoint. */
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  umail!: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  pwd!: string;
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cont_code: string | null = null;
}
/**
 * Validated body fields accepted by the forgot-password endpoint.
 */
export class ForgetPasswordDto {
  @IsString()
  @IsNotEmpty()
  umail?: string;
  @IsString()
  @IsOptional()
  cont_code?: string;
  @IsString()
  @IsOptional()
  action?: string;
}
/**
 * Request fields accepted by the forgot-password OTP verification endpoint.
 */
export class ForgotPasswordVerifyOtpDto {
  @Allow()
  otp_token?: unknown;
  @Allow()
  otp?: unknown;
  @Allow()
  identifier?: unknown;
  @Allow()
  otp_type?: unknown;
}
export class ForgotPasswordResponseDto {
  Status: number;
  Success: boolean;
  OTP: string | null;
  Message: string;
  OtpKey: string | null;
}
/**
 * Validated body fields accepted by the update-password endpoint.
 * FP_Token is generated after successful forgot-password OTP verification.
 * new_pwd contains the new password entered by the user.
 */
export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  FP_Token!: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  new_pwd!: string;
}