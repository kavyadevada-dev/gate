
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import sql from 'mssql';
import { randomUUID } from 'node:crypto';
import { connectDB } from '../config/db.js';
// Request parameters
export interface GetUserProfileParams {
  user_token: string;
  ipadd: string;
  dinfo: string;
}
// Stored procedure response structure
export interface UserProfileResponse {
  success: boolean;
  statusCode: number;
  message: string;
  requestId: string;
  data: unknown | null;
  errors: Array<{
    code: string;
    field: string | null;
    message: string;
  }>;
}
export interface UserOwnPropertiesParams {
  user_token: string;
  ipadd: string;
  dinfo: string;
}
export interface UserOwnPropertiesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  requestId: string;
  data: any;
  errors: any[];
}
@Injectable()
export class UserProfileRepository {
  private readonly logger = new Logger(UserProfileRepository.name);
  async getUserProfile(
    params: GetUserProfileParams,
  ): Promise<UserProfileResponse> {
    try {
      // Connect to SQL Server
      const pool = await connectDB();
      // Execute User Profile Stored Procedure
      const result = await pool
        .request()
        .input(
          'user_token',
          sql.VarChar(sql.MAX),
          params.user_token.trim(),
        )
        .input(
          'ipadd',
          sql.VarChar(250),
          params.ipadd.trim(),
        )
        .input(
          'dinfo',
          sql.VarChar(250),
          params.dinfo.trim(),
        )
        .output(
          'JsonOutput',
          sql.NVarChar(sql.MAX),
        )
        .execute('dbo.USP_User_Get_Profile');
      // Get JSON from OUTPUT parameter or result set
      const row = result.recordset?.[0];
      const rawResponse =
        result.output?.JsonOutput ??
        row?.JsonOutput ??
        row?.jsonOutput ??
        row?.jsonoutput;
      // Validate stored procedure response
      if (
        typeof rawResponse !== 'string' ||
        !rawResponse.trim()
      ) {
        throw new Error(
          'User profile stored procedure returned an empty response.',
        );
      }
      // Parse JSON response
      let parsedResponse: unknown;

      try {
        parsedResponse = JSON.parse(rawResponse);
      } catch {
        throw new Error(
          'User profile stored procedure returned invalid JSON.',
        );
      }
      // Validate response structure
      if (
        typeof parsedResponse !== 'object' ||
        parsedResponse === null ||
        Array.isArray(parsedResponse)
      ) {
        throw new Error(
          'Invalid user profile response structure.',
        );
      }
      const response =
        parsedResponse as Record<string, unknown>;
      if (
        typeof response.success !== 'boolean' ||
        typeof response.statusCode !== 'number' ||
        typeof response.message !== 'string'
      ) {
        throw new Error(
          'Required fields are missing from the stored procedure response.',
        );
      }
      // Return actual SP response
      return parsedResponse as UserProfileResponse;
    } catch (error: unknown) {
      this.logger.error(
        'User profile repository execution failed.',
        error instanceof Error ? error.stack : undefined,
      );
      // Do not expose internal SQL errors to frontend
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        message:
          'An unexpected error occurred. Please try again later.',
        requestId: randomUUID(),
        data: null,
        errors: [
          {
            code: 'INTERNAL_ERROR',
            field: null,
            message:
              'An unexpected error occurred. Please try again later.',
          },
        ],
      });
    }
  }
  // Get User Own Properties
async getUserOwnProperties(
  params: UserOwnPropertiesParams,
): Promise<UserOwnPropertiesResponse> {
  try {
    // Connect to database
    const pool = await connectDB();
    // Pass input parameters
    const request = pool.request();
    request.input('user_token', sql.VarChar(4000), params.user_token);
    request.input('ipadd', sql.VarChar(250), params.ipadd);
    request.input('dinfo', sql.VarChar(250), params.dinfo);
    // Get JSON response from stored procedure
    request.output('JsonOutput', sql.NVarChar(sql.MAX));
    const result = await request.execute(
      'dbo.USP_User_Own_Get_Properities',
    );
    // Read and parse JSON response
    const response =
      result.output?.JsonOutput ?? result.recordset?.[0]?.JsonOutput;
    return typeof response === 'string'
      ? JSON.parse(response)
      : response;
  } catch (error) {
    console.error('Get User Own Properties Error:', error);
    throw error;
  }
}
}
