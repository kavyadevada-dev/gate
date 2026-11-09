import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CountryRepository } from '../repositories/country.repository';
@Injectable()
export class CountryService {
  constructor(
    private readonly countryRepository: CountryRepository,
  ) {}
  /**
   * Retrieves the list of active country codes.
   * The service delegates database access to the repository,
   * parses the stored procedure response, and handles the
   * appropriate API status codes.
   */
  async getCountryCodes() {
    try {
      // Fetch the country list from the repository.
      const result =
        await this.countryRepository.getCountryCodes();
      // Handle the case where the repository returns no response.
      if (!result) {
        throw new InternalServerErrorException(
          'No response received from country list procedure',
        );
      }
      // Parse the JSON string returned by the stored procedure.
      const response = JSON.parse(result);
      // Return a 404 response when no active countries are available.
      if (response.StatusCode === 404) {
        throw new NotFoundException(
          response.StatusMessage,
        );
      }
      // Handle any non-success status returned by the stored procedure.
      if (response.StatusCode !== 200) {
        throw new InternalServerErrorException(
          response.StatusMessage,
        );
      }
      // Return the successful country list response.
      return response;
    } catch (error: unknown) {
      // Preserve NestJS HTTP exceptions without modifying them.
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      // Convert unexpected errors into an internal server error.
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          error.message,
        );
      }
      // Handle unknown error types.
      throw new InternalServerErrorException(
        'Failed to fetch country codes',
      );
    }
  }  
}
 