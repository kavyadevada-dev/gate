import { Injectable } from '@nestjs/common';
import { connectDB, sql } from '../config/db';
import { UserRegistrationDto } from '../dto/register.dto';

@Injectable()
export class RegisterRepository {

  // USER REGISTRATION GET
/**
 * Fetches the master data required for user registration.
 *
 * The stored procedure does not require any input parameters.
 * It returns the complete response as JSON, including countries,
 * societies, roles, and the corresponding status information.
 */
async userRegistrationget(): Promise<string | null> {
  try {
    const pool = await connectDB();

    // Execute the registration master-data stored procedure.
    const result = await pool
      .request()
      .execute('dbo.USP_User_Registration_Get');

    // No result returned from the stored procedure.
    if (
      !result.recordset ||
      result.recordset.length === 0
    ) {
      return null;
    }

    // Get the JSON response from the first column.
    const firstRow = result.recordset[0];
    const firstColumn = Object.keys(firstRow)[0];

    return firstColumn
      ? firstRow[firstColumn] ?? null
      : null;
  } catch (error) {
    console.error(
      'Error executing dbo.USP_User_Registration_Get:',
      error,
    );

    throw error;
  }
}
  // USER REGISTRATION PRE-CHECK
  async registrationCheck(
    umail: string,
    contCode: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<string | null> {
    try {
      const pool = await connectDB();
      const result = await pool
        .request()
        .input('umail', sql.VarChar(254), umail)
        .input('cont_code', sql.VarChar(25), contCode)
        .input('ipaddress', sql.VarChar(sql.MAX), ipAddress)
        .input('user_agent', sql.VarChar(sql.MAX), userAgent)
        .execute(
          'dbo.USP_User_Registration_Mobile_Mail_Check',
        );
      if (
        !result.recordset ||
        result.recordset.length === 0
      ) {
        return null;
      }
      const response = result.recordset
        .map((row) => Object.values(row)[0])
        .filter(
          (value): value is string =>
            typeof value === 'string',
        )
        .join('');
      return response || null;
    } catch (error) {
      console.error(
        'Error executing USP_User_Registration_Mobile_Mail_Check:',
        error,
      );
      throw error;
    }
  }
 // USER REGISTRATION
/**
 * Registers a new user in the system.
 * Executes USP_User_Registration with the registration
 * details and request metadata.
 */
async userRegistration(
  dto: UserRegistrationDto,
  ipAddress: string,
  userAgent: string,
): Promise<string | null> {
  try {
    const pool = await connectDB();

    const result = await pool
      .request()
      .input(
        'fname',
        sql.VarChar(250),
        dto.fname,
      )
      .input(
        'mobilenumber',
        sql.VarChar(100),
        dto.mobilenumber,
      )
      .input(
        'mob_cont_code',
        sql.VarChar(20),
        dto.mob_cont_code,
      )
      .input(
        'email',
        sql.VarChar(150),
        dto.email,
      )
      .input(
        'country',
        sql.VarChar(100),
        dto.country,
      )
      .input(
        'state',
        sql.VarChar(100),
        dto.state,
      )
      .input(
        'city',
        sql.VarChar(100),
        dto.city,
      )
      .input(
        'socid',
        sql.BigInt,
        dto.socid,
      )
      .input(
        'towerid',
        sql.BigInt,
        dto.towerid,
      )
      .input(
        'floorid',
        sql.BigInt,
        dto.floorid,
      )
     .input('unitnumber', sql.BigInt, dto.unitnumber)
     .input('user_role', sql.BigInt, dto.user_role)

      // Registration sub-role details
     .input('sub_role', sql.BigInt, dto.sub_role)
     .input('sub_role_cat',sql.BigInt,dto.sub_role_cat ?? null,)
     .input('unit_branch', sql.VarChar(100), dto.unit_branch)
     .input('ipaddress',sql.VarChar(sql.MAX),ipAddress,)
      .input('user_agent',sql.VarChar(sql.MAX),userAgent,)
      .execute(
        'dbo.USP_User_Registration',
      );

    if (
      !result.recordset ||
      result.recordset.length === 0
    ) {
      return null;
    }

    const response = result.recordset
      .map((row) => Object.values(row)[0])
      .filter(
        (value): value is string =>
          typeof value === 'string',
      )
      .join('');

    return response || null;
  } catch (error) {
    console.error(
      'Error executing USP_User_Registration:',
      error,
    );

    throw error;
  }
}
/**
   * Verifies the OTP for user registration.
   * Executes the stored procedure USP_Verify_User_Registration_OTP
   * with the provided user ID, OTP, identifier, OTP type, and maximum attempts.
   * @param userId - The Base64 encoded user ID.
   * @param otp - The OTP to verify.
   * @param identifier - The identifier for the OTP (e.g., 'M' for mobile, 'E' for email).
   * @param otpType - The type of OTP (default is 'UR' for user registration).
   * @param maxAttempts - The maximum number of attempts allowed (default is 5).
   * @returns A string response from the stored procedure or null if no response.
   * @throws Error if there is an issue executing the stored procedure.
   */
async verifyRegistrationOtp(
  userId: string,
  otp: string,
  identifier: string,
  otpType: string = 'UR',
  maxAttempts: number = 5,
  ipAddress: string,
  userAgent: string,
): Promise<string | null> {
  try {
    const pool = await connectDB();

    const request = pool.request();

    request.input(
      'UID_Enc',
      sql.VarChar(sql.MAX),
      userId,
    );

    request.input(
      'OTP',
      sql.VarChar(20),
      otp,
    );

    request.input(
      'Identifier',
      sql.VarChar(10),
      identifier,
    );

    request.input(
      'OTPType',
      sql.VarChar(50),
      otpType,
    );

    request.input(
      'MaxAttempts',
      sql.Int,
      maxAttempts,
    );

    request.input(
      'ipadd',
      sql.VarChar(sql.MAX),
      ipAddress,
    );

    request.input(
      'useragent',
      sql.VarChar(sql.MAX),
      userAgent,
    );

    request.output(
      'ResponseJSON',
      sql.NVarChar(sql.MAX),
    );

    const result = await request.execute(
      'dbo.USP_Verify_User_Registration_OTP',
    );

    const responseJson =
      result.output?.ResponseJSON;

    if (
      !responseJson ||
      typeof responseJson !== 'string'
    ) {
      return null;
    }

    return responseJson;
  } catch (error) {
    console.error(
      'Error executing USP_Verify_User_Registration_OTP:',
      error,
    );

    throw error;
  }
}
}