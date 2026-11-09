import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ResendOtpDto } from '../dto/otp.dto';
import { OtpRepository } from '../repositories/otp.repository';
@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OtpRepository,
  ) {}
  /**
   * Resends an OTP for an existing user.
   * Business rules such as:
   * - OTP existence
   * - OTP already used
   * - resend cooldown
   * - resend limit
   * - OTP generation
   * - OTP expiry
   * are handled by dbo.usp_ResendOTP.
   * The service is responsible for:
   * - preparing the request
   * - calling the repository
   * - parsing the SP JSON response
   * - converting the SP statusCode into an HTTP response
   */
  async resendOtp(dto: ResendOtpDto) {
    try {
      /**
       * The current SP defaults OTPType to 'UR'.
       * We also apply the same default at the API layer
       * when the client does not provide otpType.
       */
      const otpType = dto.otpType ?? 'UR';
      /**
       * Call the repository.
       * The repository handles SQL Server encryption of
       * the User ID and execution of the stored procedure.
       */
      const result =
        await this.otpRepository.resendOtp(
          dto.uid,
          otpType,
          dto.identifier,
        );
      /**
       * A missing response means the database layer did
       * not return the expected stored procedure response.
       */
      if (!result) {
        throw new InternalServerErrorException({
          statusCode: 500,
          status: 'error',
          message:
            'An unexpected error occurred while processing the request.',
          data: null,
        });
      }
      let response: any;
      /**
       * Parse the JSON returned by @ResponseJSON.
       */
      try {
        response = JSON.parse(result);
      } catch (error) {
        console.error(
          'Invalid JSON returned by dbo.usp_ResendOTP:',
          error,
        );
        throw new InternalServerErrorException({
          statusCode: 500,
          status: 'error',
          message:
            'An unexpected error occurred while processing the request.',
          data: null,
        });
      }
      /**
       * The SP response must contain a numeric statusCode.
       */
      if (
        typeof response?.statusCode !== 'number'
      ) {
        throw new InternalServerErrorException({
          statusCode: 500,
          status: 'error',
          message:
            'An unexpected error occurred while processing the request.',
          data: null,
        });
      }
      /**
       * Any 2xx response from the SP is returned directly.
       * This includes the special case where the resend
       * limit was reached and the SP created a new OTP.
       * That response is still statusCode 200.
       */
      if (
        response.statusCode >= 200 &&
        response.statusCode < 300
      ) {
        return response;
      }
      /**
       * Convert SP status codes into HTTP responses.
       * Expected error codes:
       * 400 - Invalid/missing UID
       * 404 - OTP record not found
       * 409 - OTP already used
       * 429 - Cooldown not completed
       * 500 - SQL/runtime error
       */
      throw new HttpException(
        response,
        response.statusCode,
      );
    } catch (error) {
      /**
       * Preserve the HTTP exceptions generated above.
       */
      if (error instanceof HttpException) {
        throw error;
      }
      /**
       * Unexpected database/application error.
       * Do not expose internal database details to the client.
       */
      console.error(
        'Error resending OTP:',
        error,
      );
      throw new InternalServerErrorException({
        statusCode: 500,
        status: 'error',
        message:
          'An unexpected error occurred while processing the request.',
        data: null,
      });
    }
  }
}