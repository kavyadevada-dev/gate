import { Injectable } from '@nestjs/common';
import { connectDB, sql } from '../config/db';
import { AddPetDto } from '../dto/pet.dto';
@Injectable()
export class PetRepository {
  /**
   * Executes the Add Pet reference-data stored procedure.
   * The procedure validates the session and request metadata,
   * then returns its complete JSON response.
   */
  async getAddPetReferenceData(
    userToken: string,
    ipAddress: string,
    deviceInfo: string,
  ): Promise<string | null> {
    try {
      const pool = await connectDB();
      const result = await pool
        .request()
        .input('user_token', sql.VarChar(sql.MAX), userToken)
        .input('ipadd', sql.VarChar(250), ipAddress)
        .input('dinfo', sql.VarChar(250), deviceInfo)
        .execute('dbo.USP_Add_Pet_GET');
      // The stored procedure returns one row with ResponseJson.
      const responseJson: unknown =
        result.recordset?.[0]?.ResponseJson;
      if (
        typeof responseJson !== 'string' ||
        responseJson.trim().length === 0
      ) {
        return null;
      }
      return responseJson;
    } catch (error: unknown) {
      // Log the database error internally; never log the session token.
      console.error('Error executing dbo.USP_Add_Pet_GET:', error);
      throw error;
    }
  }
  // Calls the Add Pet stored procedure with all required parameters.
  async addPet(
    userToken: string,
    ipAddress: string,
    deviceInfo: string,
    data: AddPetDto,
  ): Promise<unknown> {
    // Get the existing SQL Server connection pool.
    const pool = await connectDB();
    // Convert the incoming ISO date string to a JavaScript Date.
    const vaccinationDate = new Date(data.petvaccinationdate);
    // Execute the stored procedure with parameterized inputs.
    // Parameterized inputs help prevent SQL injection.
    const result = await pool
      .request()
      // Authentication token supplied through the Bearer header.
      .input('user_token', sql.VarChar(sql.MAX), userToken)
      // IP address captured from the incoming request.
      .input('ipadd', sql.VarChar(250), ipAddress)
      // Device information captured from the User-Agent header.
      .input('dinfo', sql.VarChar(250), deviceInfo)
      // Pet type and breed IDs.
      .input('pettype', sql.BigInt, data.pettype)
      .input('breedtype', sql.BigInt, data.breedtype)
      // Pet details submitted through multipart Form Data.
      .input('petname', sql.VarChar(200), data.petname)
      .input('petcolour', sql.VarChar(100), data.petcolour)
      // The SP accepts a string path or URL, not a raw file buffer.
      .input('petpicture', sql.VarChar(sql.MAX), data.petpicture)
      // Vaccination status, such as V, YES, or NO.
      .input(
        'petvaccinationstatus',
        sql.VarChar(20),
        data.petvaccinationstatus,
      )
      // SQL Server DATETIME parameter.
      .input(
        'petvaccinationdate',
        sql.DateTime,
        Number.isNaN(vaccinationDate.getTime())
          ? null
          : vaccinationDate,
      )
      // Execute the actual stored procedure.
      .execute('dbo.USP_User_Add_Pet');
    // Read the first returned record.
    const row = result.recordset?.[0];
    // Support the response column naming conventions used by the SP.
    const response =
      row?.response ??
      row?.Response ??
      row?.ResponseJson ??
      row?.response_json;
    // Fail clearly if the SP did not return the expected column.
    if (response === undefined || response === null) {
      throw new Error(
        'USP_User_Add_Pet did not return the response column.',
      );
    }
    // Return the SP response to the service for JSON parsing.
    return response;
  }
}
