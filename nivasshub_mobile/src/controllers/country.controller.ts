import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CountryService } from '../Service/country.service';
 
@Controller()
export class CountryController {
  constructor(
    private readonly countryService: CountryService,
  ) {}
  /**
   * Retrieves the list of active country codes..
   * GET /country-codes
   * Delegates the request to the CountryService,
   * which handles the business logic and database response.
   */
  @Get('country-codes')
  async getCountryCodes() {
    return this.countryService.getCountryCodes();
  } 
}
 