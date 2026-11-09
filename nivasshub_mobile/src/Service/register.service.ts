import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { RegisterRepository } from '../repositories/register.repository';
import { RegistrationCheckDto } from '../dto/register.dto';
import { UserRegistrationDto } from '../dto/register.dto';
import { VerifyRegistrationOtpDto } from '../dto/register.dto';
import { MailService } from '../mail/mail.service';
@Injectable()
export class RegisterService {
  constructor(
    private readonly registerRepository: RegisterRepository,
    private readonly mailService: MailService,
  ) {}
  //-------------USER REGISTRATION GET----------------------
  //-------------USER REGISTRATION GET----------------------

/**
 * Fetches the master data required for user registration.
 *
 * The stored procedure returns a JSON response containing
 * countries, societies, roles, and status information.
 */
async userregistrationget() {
  try {
    // Execute the registration master-data stored procedure.
    const result =
      await this.registerRepository.userRegistrationget();

    // Handle empty or undefined response from the repository.
    if (!result) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        errorCode: 'INTERNAL_ERROR',
        message:
          'An unexpected error occurred while fetching registration data.',
        data: null,
      });
    }

    let response;

    try {
      // Parse the JSON returned by the stored procedure.
      response = JSON.parse(result);
    } catch {
      // Handle invalid JSON returned by the database.
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        errorCode: 'INTERNAL_ERROR',
        message:
          'Invalid response received from registration data procedure.',
        data: null,
      });
    }

    // Validate the StatusCode returned by the stored procedure.
    if (
      !response ||
      typeof response.StatusCode !== 'number'
    ) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        errorCode: 'INTERNAL_ERROR',
        message:
          'Invalid registration data response.',
        data: null,
      });
    }

    // Return successful response for 2xx status codes.
    if (
      response.StatusCode >= 200 &&
      response.StatusCode < 300
    ) {
      return response;
    }

    // Preserve the status code and complete response
    // returned by the stored procedure.
    throw new HttpException(
      response,
      response.StatusCode,
    );
  } catch (error) {
    // Preserve the HTTP exception generated above.
    if (error instanceof HttpException) {
      throw error;
    }

    // Convert unexpected errors into HTTP 500.
    throw new InternalServerErrorException({
      success: false,
      statusCode: 500,
      errorCode: 'INTERNAL_ERROR',
      message:
        'An unexpected error occurred while fetching registration data.',
      data: null,
    });
  }
}
  //-------------USER REGISTRATION PRE-CHECK----------------------
  /**
   * Checks whether an email or mobile number can proceed
   * with user registration.
   * The stored procedure returns an HTTP-style status code
   * and JSON response.
   */
  async registrationCheck(
    dto: RegistrationCheckDto,
    req: Request,

  ) {
    try {
      // Get the IP address of the request
      const ipAddress = req.ip || '';

      // Get the browser/app user-agent
      const userAgent = req.headers['user-agent'] || '';
      // Call the repository to execute the stored procedure.
      const result =
        await this.registerRepository.registrationCheck(
          dto.umail ?? '',
          dto.cont_code ?? '',
          ipAddress,
          userAgent,
        );
      // Handle no response from the stored procedure.
      if (!result) {
        throw new InternalServerErrorException({
          success: false,
          statusCode: 500,
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'An unexpected error occurred. Please try again later',
        });
      }
      let response;
      try {
        // Parse the JSON returned by the stored procedure.
        response = JSON.parse(result);
      } catch {
        // Handle invalid JSON from the database.
        throw new InternalServerErrorException({
          success: false,
          statusCode: 500,
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'An unexpected error occurred. Please try again later',
        });
      }
      // Validate the statusCode returned by the stored procedure.
      if (
        !response ||
        typeof response.statusCode !== 'number'
      ) {
        throw new InternalServerErrorException({
          success: false,
          statusCode: 500,
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'An unexpected error occurred. Please try again later',
        });
      }
      // Return successful response.
      if (
        response.statusCode >= 200 &&
        response.statusCode < 300
      ) {
        return response;
      }
      /**
       * Preserve the status code and response body
       * returned by the stored procedure.
       */
      throw new HttpException(
        response,
        response.statusCode,
      );
    } catch (error) {
      // Preserve the HTTP response generated from
      // the stored procedure.
      if (error instanceof HttpException) {
        throw error;
      }
      // Convert unexpected errors into HTTP 500.
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'An unexpected error occurred. Please try again later',
      });
    }
  }
  //---------------------USER REGISTRATION---------------------------
  /**
   * Registers a new user in the system.
   * The stored procedure handles business validation and returns
   * an HTTP-style status code and JSON response.
   * If registration is successful, an email with an OTP is sent
   * to the user's email address.
   */
async userRegistration(
  dto: UserRegistrationDto,
  req: Request,
) {
  try {
    const ipAddress = req.ip || '';
    const userAgent = req.headers['user-agent'] || '';

    const result =
      await this.registerRepository.userRegistration(
       dto,
       ipAddress,
       userAgent,
       );
    if (!result) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        errorCode: 'INTERNAL_ERROR',
        message:
          'An unexpected error occurred while processing the request.',
        data: null,
      });
    }
    let response;
    try {
      response = JSON.parse(result);
    } catch {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        errorCode: 'INTERNAL_ERROR',
        message:
          'An unexpected error occurred while processing the request.',
        data: null,
      });
    }
    if (
      !response ||
      typeof response.statusCode !== 'number'
    ) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        errorCode: 'INTERNAL_ERROR',
        message:
          'An unexpected error occurred while processing the request.',
        data: null,
      });
    }
    // 200 / 201 success
    if (
      response.statusCode === 200 ||
      response.statusCode === 201
    ) {
  try {
    await this.mailService.sendRegistrationEmail(
      response.data?.email ?? dto.email,
      response.data?.fname ?? dto.fname,
      response.data?.emailOtp,
    );
  } catch (mailError) {
    console.error(
      'Registration email failed:',
      mailError,
    );
  }
      return response;
    }
    // Preserve SP response and HTTP status
    throw new HttpException(
      response,
      response.statusCode,
    );
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new InternalServerErrorException({
      success: false,
      statusCode: 500,
      errorCode: 'INTERNAL_ERROR',
      message:
        'An unexpected error occurred while processing the request.',
      data: null,
    });
  }
}
async verifyRegistrationOtp(
  dto: VerifyRegistrationOtpDto,
  req: Request,
) {
  try {
    const ipAddress = req.ip || '';
    const userAgent =
      req.headers['user-agent'] || '';
    const result =
      await this.registerRepository.verifyRegistrationOtp(
       dto.userId,
       dto.otp,
       dto.identifier,
       'UR', // OTP type defined by the registration SP
        5,    // Maximum OTP attempts defined by the registration SP
       ipAddress,
       userAgent,
  );
    if (!result) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        status: 'Internal Server Error',
        errorCode: 'INTERNAL_ERROR',
        message:
          'An unexpected error occurred while verifying OTP.',
        data: null,
      });
    }
    let response;
    try {
      response = JSON.parse(result);
    } catch {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        status: 'Internal Server Error',
        errorCode: 'INTERNAL_ERROR',
        message:
          'Invalid response received from OTP verification procedure.',
        data: null,
      });
    }
    if (
      !response ||
      typeof response.statusCode !== 'number'
    ) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        status: 'Internal Server Error',
        errorCode: 'INTERNAL_ERROR',
        message:
          'Invalid OTP verification response.',
        data: null,
      });
    }
    // OTP verified successfully
    if (response.statusCode === 200) {
      return response;
    }
    // Preserve the status code and response
    // returned by the stored procedure.
    throw new HttpException(
      response,
      response.statusCode,
    );
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new InternalServerErrorException({
      success: false,
      statusCode: 500,
      status: 'Internal Server Error',
      errorCode: 'INTERNAL_ERROR',
      message:
        'An unexpected error occurred while verifying OTP.',
      data: null,
    });
  }
}
}