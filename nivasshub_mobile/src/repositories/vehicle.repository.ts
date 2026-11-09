import { Injectable } from '@nestjs/common';
import { connectDB, sql } from '../config/db';
@Injectable()
export class VehicleRepository {
  /**
   * Retrieves vehicle brand master data from SQL Server.
   * @param userToken - Valid session or refresh token.
   * @param ipAddress - Client IPv4 or IPv6 address.
   * @param deviceInfo - Client device/browser information.
   * @returns JSON response from the stored procedure, or null
   *          if no result is returned.
   */
async getVehicleBrands(
  userToken: string,
  ipAddress: string,
  deviceInfo: string,
): Promise<string | null> {
  try {
    // Connect to SQL Server.
    const pool = await connectDB();
    // Execute the stored procedure.
    const result = await pool
      .request()
      .input('user_token', sql.VarChar(sql.MAX), userToken)
      .input('ipadd', sql.VarChar(500), ipAddress)
      .input('dinfo', sql.VarChar(500), deviceInfo)
      .execute('dbo.USP_Get_Vehicle_Brands_Json');
    // Read the JSON response.
    const response: unknown = result.recordset?.[0]?.Result;
    if (typeof response !== 'string' || !response.trim()) {
      return null;
    }
    return response;
  } catch (error: unknown) {
    // Log the underlying error without exposing the session token.
    console.error('Vehicle repository error:', error);
    throw error;
  }
}
  /**
   * Registers a vehicle using the authenticated user's token.
   * The stored procedure derives the resident ID from the token.
   */
  async addVehicle(
    userToken: string,
    vehicleType: string,
    vehicleRegistrationNumber: string,
    vehicleBrandId: number,
    vehicleModel: string,
    vehicleColour: string,
    ipAddress: string,
    parkingZoneId: number,
    deviceInfo: string,
  ): Promise<{ HttpStatusCode: number; JsonResponse: string } | null> {
    const pool = await connectDB();
    const result = await pool
      .request()
      // Match the updated stored procedure's parameters exactly.
      .input('user_token', sql.VarChar(sql.MAX), userToken)
      .input('vehicletype', sql.VarChar(100), vehicleType)
      .input(
        'vehicleregistrationnumber',
        sql.VarChar(100),
        vehicleRegistrationNumber,
      )
      .input('vehiclebrandid', sql.BigInt, vehicleBrandId)
      .input('vehiclemodel', sql.VarChar(100), vehicleModel)
      .input('vehicle_colour', sql.VarChar(100), vehicleColour)
      .input('ipadd', sql.VarChar(500), ipAddress)
      .input('parkingzoneid', sql.BigInt, parkingZoneId)
      .input('dinfo', sql.VarChar(500), deviceInfo)
      .execute('dbo.USP_User_Add_Vehicle');
    // The procedure returns the HTTP status and JSON body in one row.
    const row = result.recordset?.[0];
    if (!row) {
      return null;
    }
    return {
      HttpStatusCode: Number(row.HttpStatusCode),
      JsonResponse: String(row.JsonResponse ?? ''),
    };
  }
}