import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PetRepository } from '../repositories/pet.repository';
import { AddPetDto } from '../dto/pet.dto';
import { randomUUID } from 'crypto';
@Injectable()
export class PetService {
  constructor(
    private readonly petRepository: PetRepository,
  ) {}
  /**
   * Retrieves reference data required for the Add Pet screen.
   * The stored procedure validates the token, IP and device info.
   */
  async getAddPetReferenceData(
    userToken: string,
    ipAddress: string,
    deviceInfo: string,
  ): Promise<Record<string, unknown>> {
    try {
      // Execute the stored procedure through the repository.
      const jsonResponse =
        await this.petRepository.getAddPetReferenceData(
          userToken,
          ipAddress,
          deviceInfo,
        );
      // A missing response means the procedure did not return usable data.
      if (!jsonResponse) {
        throw new InternalServerErrorException({
          success: false,
          status_code: 500,
          message: 'An unexpected error occurred.',
          data: null,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred.',
          },
          meta: {
            request_id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          },
        });
      }
      // Parse the JSON without changing the stored procedure's response.
      let response: unknown;
      try {
        response = JSON.parse(jsonResponse);
      } catch {
        throw new InternalServerErrorException({
          success: false,
          status_code: 500,
          message: 'An unexpected error occurred.',
          data: null,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred.',
          },
          meta: {
            request_id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          },
        });
      }
      // Ensure the procedure returned a JSON object.
      if (
        typeof response !== 'object' ||
        response === null ||
        Array.isArray(response)
      ) {
        throw new InternalServerErrorException({
          success: false,
          status_code: 500,
          message: 'An unexpected error occurred.',
          data: null,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred.',
          },
          meta: {
            request_id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          },
        });
      }
      const body = response as Record<string, unknown>;
      const statusCode = Number(body.status_code);
      // Accept only valid HTTP status codes from the stored procedure.
      if (
        !Number.isInteger(statusCode) ||
        statusCode < 100 ||
        statusCode > 599
      ) {
        throw new InternalServerErrorException({
          success: false,
          status_code: 500,
          message: 'An unexpected error occurred.',
          data: null,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred.',
          },
          meta: {
            request_id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          },
        });
      }
      // Preserve the original response and its status code.
      if (statusCode >= 200 && statusCode < 300) {
        return body;
      }
      // Send SP-generated validation and authentication errors with
      // the matching HTTP status code.
      throw new HttpException(body, statusCode);
    } catch (error: unknown) {
      // Preserve the response and status of known HTTP exceptions.
      if (error instanceof HttpException) {
        throw error;
      }
      // Do not expose database or internal implementation details.
      console.error('Error retrieving Add Pet reference data:', error);
      throw new InternalServerErrorException({
        success: false,
        status_code: 500,
        message: 'An unexpected error occurred.',
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred.',
        },
        meta: {
          request_id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
  /// Calls the repository, parses the SP response,
  // and returns the response body and HTTP status.
  async addPet(
    userToken: string,
    ipAddress: string,
    deviceInfo: string,
    data: AddPetDto,
  ): Promise<{
    statusCode: number;
    response: Record<string, any>;
  }> {
    // Create a request ID for logs and error tracking.
    const requestId = randomUUID();
    try {
      // Pass the token, request metadata, and form data to SQL.
      const raw = await this.petRepository.addPet(
        userToken,
        ipAddress,
        deviceInfo,
        data,
      );
      // The SP may return a JSON string or an already parsed object.
      const parsed =
        typeof raw === 'string' ? JSON.parse(raw) : raw;
      // Ensure the response is a JSON object.
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed)
      ) {
        throw new Error(
          'Stored procedure returned an invalid JSON response.',
        );
      }
      // Treat the SP response as the authoritative response body.
      const response = parsed as Record<string, any>;
      // Read the status returned by the stored procedure.
      const statusCode = Number(
        response.status ?? response.status_code,
      );
      // Reject responses that do not contain a valid HTTP status.
      if (
        !Number.isInteger(statusCode) ||
        statusCode < 100 ||
        statusCode > 599
      ) {
        throw new Error(
          'Stored procedure returned an invalid HTTP status.',
        );
      }
      // Add metadata only when the SP did not return it.
      response.meta ??= {};
      response.meta.requestId ??= requestId;
      response.meta.timestamp ??= new Date().toISOString();
      // Return the original SP response and its HTTP status.
      return {
        statusCode,
        response,
      };
    } catch (error) {
      // Log the real exception on the server for debugging.
      // Avoid exposing database details to the frontend.
      console.error('Add Pet service error:', error);
      // Return a standardized generic internal error.
      return {
        statusCode: 500,
        response: {
          success: false,
          status: 500,
          error: {
            code: 'INTERNAL_ERROR',
            message:
              'An unexpected error occurred. Please try again later.',
            field: null,
          },
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
          },
        },
      };
    }
  }
}
