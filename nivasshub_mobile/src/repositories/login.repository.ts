import { Injectable } from '@nestjs/common';
import { connectDB, sql } from '../config/db';
import {
  ForgotPasswordVerifyOtpRequest,
  LoginProcedureRequest,
  UpdatePasswordRequest,
} from '../types/login.types';
import { ForgetPasswordDto, ForgotPasswordResponseDto } from '../dto/login.dto';
@Injectable()
export class LoginRepository {
  /** Executes the login stored procedure with the request parameters. */
  async login(credentials: LoginProcedureRequest): Promise<string | null> {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input('umail', sql.VarChar(100), credentials.umail)
      .input('pwd', sql.VarChar(100), credentials.pwd)
      .input('cont_code', sql.VarChar(20), credentials.cont_code)
      .input('ipadd', sql.VarChar(500), credentials.ipadd)
      .input('dinfo', sql.VarChar(500), credentials.dinfo)
      .execute('dbo.USP_User_login');
    if (!result.recordset?.length) return null;
    // Return the single JSON value produced by SQL Server.
    const row = result.recordset[0] as Record<string, unknown>;
    const response = row.Result ?? Object.values(row)[0];
    return typeof response === 'string' ? response : null;
  }

  async verifyForgotPasswordOtp(
    request: ForgotPasswordVerifyOtpRequest,
  ): Promise<string | null> {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input('otp_token', sql.VarChar(sql.MAX), request.otp_token)
      .input('otp', sql.VarChar(20), request.otp)
      .input('identifier', sql.VarChar(10), request.identifier)
      .input('otp_type', sql.VarChar(20), request.otp_type)
      .execute('dbo.USP_Forgot_Password_Verify_OTP');
    if (!result.recordset?.length) return null;
    const row = result.recordset[0] as Record<string, unknown>;
    const response = row.Result ?? Object.values(row)[0];
    return typeof response === 'string' ? response : null;
  }
  //forgotpassword for User
  async forgotPassword(
    dto: ForgetPasswordDto,
  ): Promise<ForgotPasswordResponseDto> {
    try {
      // Establish connection with the database
      const pool = await connectDB();
      // Execute the Forgot Password stored procedure
      // using the parameters received from the API request
      const result = await pool
        .request()
        .input('umail', dto.umail)
        .input('cont_code', dto.cont_code ?? null)
        .input('action', dto.action ?? null)
        .execute('USP_User_Forgot_Password');
      // The stored procedure returns the response
      // as a JSON string inside the Result column
      const response: ForgotPasswordResponseDto = JSON.parse(
        result.recordset[0].Result,
      );
      // Return the stored procedure response
      return response;
    } catch (error) {
      // Pass the database/stored procedure error
      // to the service layer for handling
      throw error;
    }
  }
  /**
 * Executes the USP_FP_Update_Password stored procedure.
 * The stored procedure is responsible for:
 * - Validating the FP token
 * - Validating the user account status
 * - Updating the user's password
 * - Invalidating active user sessions
 * - Returning the final JSON response
 */
async updatePassword(
  request: UpdatePasswordRequest,
): Promise<string | null> {
  try {
    // Establish a connection with the SQL Server database.
    const pool = await connectDB();
    // Create a database request and pass the required
    // parameters to the stored procedure.
    const result = await pool
      .request()
      // FP_Token is generated during the forgot-password
      // OTP verification process.
      .input(
        'FP_Token',
        sql.VarChar(sql.MAX),
        request.FP_Token,
      )
      // Pass the new password to the stored procedure.
      .input(
        'new_pwd',
        sql.VarChar(150),
        request.new_pwd,
      )
      // Execute the password update stored procedure.
      .execute('dbo.USP_FP_Update_Password');
    // If SQL Server did not return any record,
    // return null so the service can handle it as an error.
    if (!result.recordset?.length) {
      return null;
    }
    // The stored procedure returns the JSON response
    // as a value inside the Result column.
    const row = result.recordset[0] as Record<string, unknown>;
    // Get the Result column.
    // Object.values(row)[0] is used as a fallback
    // in case the column name is different.
    const response = row.Result ?? Object.values(row)[0];
    // Return the JSON response only when it is a string.
    return typeof response === 'string' ? response : null;
  } catch (error) {
    // Pass the database/stored procedure error
    // to the service layer.
    throw error;
  }
}
}
