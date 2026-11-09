import { Injectable } from '@nestjs/common';
import { connectDB } from '../config/db';
 
@Injectable()
export class CountryRepository {
  /**
   * Fetches the country code list from the database.
   */
  async getCountryCodes() {
    // Get the shared SQL Server connection pool.
    const pool = await connectDB();
    // Execute the country list stored procedure.
    const result = await pool
      .request()
      .execute('dbo.USP_Get_User_Country_List');
    // Return null if no record was returned.
    if (!result.recordset?.length) {
      return null;
    }
    // Return the JSON response from the Result column.
    return result.recordset[0].Result;
  }  
}
 