import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {SocietyDetailsDto,AddUserToSocietyDto,} from '../dto/society.dto';
import { SocietyRepository } from '../repositories/society.repository';
/**
 * Service responsible for Society-related business operations.
 * The service sits between the Controller and Repository.
 */
@Injectable()
export class SocietyService {
  constructor(
    private readonly societyRepository: SocietyRepository,
  ) {}
  /**
   * Retrieves the complete active structure of a society.
   * The stored procedure is responsible for:
   * - Society validation
   * - Active society filtering
   * - Active tower filtering
   * - Active floor filtering
   * - Active unit filtering
   * - Building the response JSON
   * - Returning the status code
   */
  async getSocietyDetails(
    dto: SocietyDetailsDto,
  ) {
    try {
      /**
       * GET query parameters are received as strings because
       * transform:true is not enabled in the global ValidationPipe.
       */
      const societyId = Number(dto.socid);
      /**
       * Validate the value before passing it to SQL Server.
       */
      if (
        !Number.isInteger(societyId) ||
        societyId < 1 ||
        societyId > 2147483647
      ) {
        throw new HttpException(
          {
            statusCode: 400,
            status: 'error',
            message: 'Invalid request.',
            data: null,
            errors: [
              {
                code: 'INVALID_SOCIETY_ID',
                field: 'societyId',
                message:
                  'societyId is required and must be a positive integer.',
              },
            ],
            meta: {
              apiVersion: 'v1',
              timestamp: new Date().toISOString(),
            },
          },
          400,
        );
      }
      /**
       * Call the repository to execute the stored procedure.
       * The repository returns:
       * - jsonResponse
       * - statusCode
       */
      const result =
        await this.societyRepository.getSocietyDetails(
          societyId,
        );
      /**
       * The stored procedure should always return JsonResponse.
       * If it is missing, treat it as an unexpected server error.
       */
      if (!result.jsonResponse) {
        throw new InternalServerErrorException({
          statusCode: 500,
          status: 'error',
          message:
            'An unexpected error occurred while processing the request.',
          data: null,
          errors: [
            {
              code: 'INTERNAL_SERVER_ERROR',
              message:
                'Please contact support with this reference.',
            },
          ],
          meta: {
            apiVersion: 'v1',
            timestamp: new Date().toISOString(),
          },
        });
      }
      /**
       * The stored procedure already creates the complete
       * JSON response.
       * Parse it so that we can determine the HTTP status code.
       */
      let response: any;
      try {
        response = JSON.parse(result.jsonResponse);
      } catch (error) {
        /**
         * JsonResponse should always contain valid JSON.
         * If parsing fails, treat it as an unexpected server error.
         */
        console.error(
          'Invalid JSON returned by USP_Registration_Get_Society_Details:',
          error,
        );
        throw new InternalServerErrorException({
          statusCode: 500,
          status: 'error',
          message:
            'An unexpected error occurred while processing the request.',
          data: null,
          errors: [
            {
              code: 'INTERNAL_SERVER_ERROR',
              message:
                'Please contact support with this reference.',
            },
          ],
          meta: {
            apiVersion: 'v1',
            timestamp: new Date().toISOString(),
          },
        });
      }
      /**
       * Use the statusCode returned by the stored procedure.
       * The output parameter is used as a fallback in case
       * the JSON does not contain a valid statusCode.
       */
      const statusCode =
        typeof response?.statusCode === 'number'
          ? response.statusCode
          : result.statusCode;
      /**
       * If the stored procedure did not provide a valid status
       * code, we cannot safely determine the HTTP response.
       */
      if (
        typeof statusCode !== 'number' ||
        !Number.isInteger(statusCode)
      ) {
        throw new InternalServerErrorException({
          statusCode: 500,
          status: 'error',
          message:
            'An unexpected error occurred while processing the request.',
          data: null,
          errors: [
            {
              code: 'INTERNAL_SERVER_ERROR',
              message:
                'Please contact support with this reference.',
            },
          ],
          meta: {
            apiVersion: 'v1',
            timestamp: new Date().toISOString(),
          },
        });
      }
      /**
       * For successful responses, return the JSON generated
       * by the stored procedure.
       */
      if (
        statusCode >= 200 &&
        statusCode < 300
      ) {
        return response;
      }
      /**
       * For 400, 404, and other error responses, use the
       * status code supplied by the stored procedure.
       * This ensures that NestJS sends the correct HTTP status
       * instead of always returning HTTP 200.
       */
      throw new HttpException(
        response,
        statusCode,
      );
    } catch (error) {
      /**
       * If the error is already an HttpException created above,
       * preserve it exactly as it is.
       */
      if (error instanceof HttpException) {
        throw error;
      }
      /**
       * Any unexpected repository/database/application error
       * is converted into a generic 500 response.
       * Internal database details are not exposed to the client.
       */
      console.error(
        'Error fetching society details:',
        error,
      );
      throw new InternalServerErrorException({
        statusCode: 500,
        status: 'error',
        message:
          'An unexpected error occurred while processing the request.',
        data: null,
        errors: [
          {
            code: 'INTERNAL_SERVER_ERROR',
            message:
              'Please contact support with this reference.',
          },
        ],
        meta: {
          apiVersion: 'v1',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
  /**
 * Retrieves all master data required for the Add Society screen.
 * The stored procedure handles:
 * - Session/token validation
 * - IP validation
 * - Device information validation
 * - Master data retrieval
 * - Response/status generation
 * @param userToken - User session/refresh token.
 * @param ipAddress - Client IP address.
 * @param deviceInfo - Client device information.
 */
async getAddSocietyMasterData(
  userToken: string,
  ipAddress: string,
  deviceInfo: string,
) {
  try {
    /**
     * Execute the stored procedure through the repository.
     * The repository returns the JSON generated by the SP.
     */
    const jsonResponse =
      await this.societyRepository.getAddSocietyMasterData(
        userToken,
        ipAddress,
        deviceInfo,
      );
    /**
     * The stored procedure should always return
     * a JSON response.
     */
    if (!jsonResponse) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        message:
          'Unable to retrieve master data.',
        data: null,
      });
    }
    /**
     * Parse the JSON generated by the stored procedure.
     * We return the SP response as-is without reshaping
     * the master-data structure.
     */
    let response: any;
    try {
      response = JSON.parse(jsonResponse);
    } catch (error) {
      console.error(
        'Invalid JSON returned by dbo.USP_Add_Society_Get:',
        error,
      );
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        message:
          'An unexpected error occurred while processing the request.',
        data: null,
      });
    }
    /**
     * Use the statusCode generated by the stored procedure
     * so that 400/401/500 responses are returned correctly.
     */
    const statusCode =
      typeof response?.statusCode === 'number'
        ? response.statusCode
        : 500;
    /**
     * Successful response.
     */
    if (
      statusCode >= 200 &&
      statusCode < 300
    ) {
      return response;
    }
    /**
     * SP-generated validation/authentication error.
     */
    throw new HttpException(
      response,
      statusCode,
    );
  } catch (error) {
    /**
     * Preserve HttpException responses generated above.
     */
    if (error instanceof HttpException) {
      throw error;
    }
    /**
     * Do not expose internal database details
     * to the client.
     */
    console.error(
      'Error fetching Add Society master data:',
      error,
    );
    throw new InternalServerErrorException({
      success: false,
      statusCode: 500,
      message:
        'An unexpected error occurred while processing the request.',
      data: null,
    });
  }
}
  /** Adds a registered user to a society unit using the stored procedure. */
  async addUserToSociety(
    dto: AddUserToSocietyDto,
    ipAddress: string,
    deviceInfo: string,
  ) {
    try {
      // Execute the stored procedure through the repository.
      const jsonResponse =
        await this.societyRepository.addUserToSociety(
          dto,
          ipAddress,
          deviceInfo,
        );

      // A missing response indicates an unexpected server error.
      if (!jsonResponse) {
        throw new InternalServerErrorException({
          success: false,
          statusCode: 500,
          message: 'Unable to add user to society.',
          data: null,
        });
      }
      // Parse the JSON response returned by SQL Server.
      let response: any;
      try {
        response = JSON.parse(jsonResponse);
      } catch {
        throw new InternalServerErrorException({
          success: false,
          statusCode: 500,
          message: 'Invalid response received from the database.',
          data: null,
        });
      }
      // Preserve the status code and response generated by the SP.
      const statusCode = Number(response?.statusCode);
      if (
        !Number.isInteger(statusCode) ||
        statusCode < 100 ||
        statusCode > 599
      ) {
        throw new InternalServerErrorException({
          success: false,
          statusCode: 500,
          message: 'Invalid response received from the database.',
          data: null,
        });
      }
      if (statusCode >= 200 && statusCode < 300) {
        return response;
      }
      throw new HttpException(response, statusCode);
    } catch (error) {
      // Preserve the SP's HTTP status and response body.
      if (error instanceof HttpException) {
        throw error;
      }
      // Log internal errors without exposing database details.
      console.error('Error adding user to society:', error);
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        message: 'An unexpected error occurred.',
        data: null,
      });
    }
  }
/// GET CountriesStatesSocieties
async getCountriesStatesSocieties(sessionToken: string) {
  try {
    // Check whether the session token is provided.
    if (!sessionToken) {
      throw new HttpException(
        {
          status: 'error',
          statusCode: 400,
          message: 'Session token is required.',
          data: null,
          timestamp: new Date().toISOString(),
        },
        400,
      );
    }
    // Call the repository to execute the stored procedure
    // and pass the session token to SQL Server.
    const result =
      await this.societyRepository
        .getCountriesStatesSocieties(sessionToken);
    // Handle the case where the stored procedure returns no response.
    if (!result) {
      throw new InternalServerErrorException(
        'No response received from stored procedure.',
      );
    }
    let response: any;
    // Parse the JSON string returned by the stored procedure
    // into a JavaScript object.
    try {
      response = JSON.parse(result);
    } catch (error) {
      // Log the parsing error if the SP response is invalid JSON.
      console.error(
        'Failed to parse SP response:',
        error,
      );
      throw new InternalServerErrorException(
        'Invalid response received from stored procedure.',
      );
    }
    // Read the HTTP status code returned by the stored procedure.
    // Use 500 if the status code is missing or invalid.
    const statusCode =
      Number(response?.statusCode) || 500;
    // If the SP returns an error status, send its response
    // to the client with the corresponding HTTP status code.
    if (statusCode !== 200) {
      throw new HttpException(
        response,
        statusCode,
      );
    }
    // Return the successful Country → State → Society hierarchy.
    return response;
  } catch (error) {
    // Preserve existing HTTP exceptions and their status codes.
    if (error instanceof HttpException) {
      throw error;
    }
    // Log unexpected repository, database, or application errors.
    console.error(
      'Get Countries States Societies Service Error:',
      error,
    );
    // Return a standardized HTTP 500 response for unexpected errors.
    throw new InternalServerErrorException({
      status: 'error',
      statusCode: 500,
      message:
        'An unexpected error occurred. Please try again later.',
      data: null,
      timestamp: new Date().toISOString(),
    });
  }
}
}