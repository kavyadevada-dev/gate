import {
  Injectable,
  HttpException,
  InternalServerErrorException,BadRequestException
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AddFamilyRepository } from '../repositories/family.repository';
import { UserAddFamilyDto } from '../dto/family.dto';
@Injectable()
export class AddFamilyService {
  constructor(
    private readonly addFamilyRepository: AddFamilyRepository,
  ) {}
  // Retrieve family categories and relations from the stored procedure.
  async getAddFamilyMasterData(
    userToken: string,
    ipAddress: string,
    deviceInfo: string,
  ) {
    try {
      // Validate the authentication token.
      if (!userToken) {
        throw new HttpException(
          {
            success: false,
            statusCode: 401,
            message: 'Authentication token is required.',
            data: null,
            error: {
              code: 'TOKEN_REQUIRED',
              field: 'user_token',
            },
            meta: {
              requestId: randomUUID(),
              timestamp: new Date().toISOString(),
            },
          },
          401,
        );
      }
      // Call the repository to execute the stored procedure.
      const result =
        await this.addFamilyRepository.getAddFamilyData(
          userToken,
          ipAddress,
          deviceInfo,
        );
      // Handle an empty response from the stored procedure.
      if (!result) {
        throw new InternalServerErrorException(
          'No response received from stored procedure.',
        );
      }
      let response: any;
      // Parse the JSON response returned by SQL Server.
      try {
        response = JSON.parse(result);
      } catch (error) {
        // Log JSON parsing errors for debugging.
        console.error('Failed to parse family SP response:', error);
        throw new InternalServerErrorException(
          'Invalid response received from stored procedure.',
        );
      }
      // Read the status code returned by the stored procedure.
      const statusCode = Number(response?.statusCode) || 500;
      // Return the stored procedure's error response when unsuccessful.
      if (statusCode !== 200) {
        throw new HttpException(response, statusCode);
      }
      // Return family categories and relations on success.
      return response;
    } catch (error) {
      // Preserve existing HTTP exceptions and their status codes.
      if (error instanceof HttpException) {
        throw error;
      }
      // Log unexpected repository or application errors.
      console.error('Get Add Family Service Error:', error);
      // Return a standardized internal server error response.
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        message: 'Unable to retrieve family relations.',
        data: null,
        error: {
          code: 'DATA_UNAVAILABLE',
          field: null,
        },
        meta: {
          requestId: randomUUID(),
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
   // Add a family member using the stored procedure
  async addFamilyMember(
    userToken: string,
    ipAddress: string,
    deviceInfo: string,
    data: UserAddFamilyDto,
  ): Promise<{ statusCode: number; response: any }> {
    const meta = {
      request_id: randomUUID(),
      timestamp: new Date().toISOString(),
    };
    try {
      // Validate required request details
      if (!userToken) {
        throw new BadRequestException({
          success: false,
          status: 401,
          message: 'User token is required.',
          data: null,
          error: {
            code: 'TOKEN_REQUIRED',
            field: 'user_token',
            detail: 'Authorization token is missing.',
          },
          meta,
        });
      }
      if (!ipAddress) {
        throw new BadRequestException({
          success: false,
          status: 400,
          message: 'IP address is required.',
          data: null,
          error: {
            code: 'IP_REQUIRED',
            field: 'ipadd',
            detail: 'Client IP address is missing.',
          },
          meta,
        });
      }
      if (!deviceInfo) {
        throw new BadRequestException({
          success: false,
          status: 400,
          message: 'Device information is required.',
          data: null,
          error: {
            code: 'DEVICE_INFO_REQUIRED',
            field: 'dinfo',
            detail: 'Device information is missing.',
          },
          meta,
        });
      }
      // Execute the repository and stored procedure
      const result = await this.addFamilyRepository.addFamilyMember(
        userToken,
        ipAddress,
        deviceInfo,
        data,
      );
      // Ensure the stored procedure returned the expected columns
      if (!result?.response_json) {
        throw new InternalServerErrorException({
          success: false,
          status: 500,
          message: 'Invalid response from stored procedure.',
          data: null,
          error: {
            code: 'INVALID_SP_RESPONSE',
            field: null,
            detail: 'Expected response_json was not returned.',
          },
          meta,
        });
      }
      // Parse the JSON response returned by SQL Server
      const response =
        typeof result.response_json === 'string'
          ? JSON.parse(result.response_json)
          : result.response_json;
      const statusCode = Number(result.http_status_code);
      // Validate the HTTP status returned by the stored procedure
      if (
        !Number.isInteger(statusCode) ||
        statusCode < 100 ||
        statusCode > 599
      ) {
        throw new InternalServerErrorException({
          success: false,
          status: 500,
          message: 'Invalid HTTP status from stored procedure.',
          data: null,
          error: {
            code: 'INVALID_HTTP_STATUS',
            field: null,
            detail: 'The stored procedure returned an invalid HTTP status.',
          },
          meta,
        });
      }
      // Add metadata if it was not included in the SP response
      response.meta ??= meta;
      // Return the actual status and body to the controller
      return {
        statusCode,
        response,
      };
    } catch (error) {
      // Preserve known NestJS HTTP exceptions
      if (error instanceof HttpException) {
        throw error;
      }
      // Log unexpected errors for debugging
      console.error('Add family member service error:', error);
      throw new InternalServerErrorException({
        success: false,
        status: 500,
        message: 'Failed to add family member.',
        data: null,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          field: null,
          detail: 'An unexpected server error occurred.',
        },
        meta,
      });
    }
  }
}