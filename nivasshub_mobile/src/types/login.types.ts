import { LoginDto } from '../dto/login.dto';
/** JSON envelope returned by the login procedure. */
export interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    refreshToken: string | null;
  };
}
/** Internal procedure parameters, including server-derived metadata. */
export type LoginProcedureRequest = LoginDto & {
  ipadd: string;
  dinfo: string;
};

export interface ForgotPasswordVerifyOtpRequest {
  otp_token: string;
  otp: string;
  identifier: string;
  otp_type: string;
}

export interface ForgotPasswordVerifyOtpResponse {
  statusCode: 200 | 400 | 401 | 403 | 404 | 409 | 410 | 500;
  success: boolean;
  FP_Token?: string;
  message: string;
}
/**
 * Request parameters required by the
 * USP_FP_Update_Password stored procedure.
 */
export interface UpdatePasswordRequest {
  /** Forgot-password token received after OTP verification. */
  FP_Token: string;
  /** New password entered by the user. */
  new_pwd: string;
}
/**
 * JSON response returned by the
 * USP_FP_Update_Password stored procedure.
 */
export interface UpdatePasswordResponse {
  /** HTTP-style status code returned by the stored procedure. */
  HttpStatus: number;
  /** Success or error message returned by the stored procedure. */
  Message: string;
}