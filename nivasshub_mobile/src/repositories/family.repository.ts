import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { connectDB } from '../config/db';
import { UserAddFamilyDto } from '../dto/family.dto';
@Injectable()
export class AddFamilyRepository {
  // Fetch family master data using the stored procedure.
  async getAddFamilyData(
    userToken: string,
    ipAddress: string,
    deviceInfo: string,
  ): Promise<string | null> {
    try {
      // Establish a connection to SQL Server.
      const pool = await connectDB();
      // Pass the required parameters and execute the stored procedure.
      const result = await pool.request()
        .input('user_token', sql.VarChar(sql.MAX), userToken)
        .input('ipadd', sql.VarChar(250), ipAddress)
        .input('dinfo', sql.VarChar(250), deviceInfo)
        .output('JsonOutput', sql.NVarChar(sql.MAX))
        .execute('USP_Add_Family_GET');
      // Return the JSON response from the output parameter.
      return result.output.JsonOutput ?? null;
    } catch (error) {
      // Log database errors and forward them to the service layer.
      console.error('USP_Add_Family_GET error:', error);
      throw error;
    }
  }
  // Add a family member using the stored procedure.
async addFamilyMember(
  userToken: string,
  ipAddress: string,
  deviceInfo: string,
  data:UserAddFamilyDto,
): Promise<any> {
  try {
    // Establish a connection with SQL Server.
    const pool = await connectDB();
    // Pass all eight parameters to the stored procedure.
    const result = await pool.request()
      .input('user_token', sql.VarChar(sql.MAX), userToken)
      .input('ipadd', sql.VarChar(250), ipAddress)
      .input('dinfo', sql.VarChar(250), deviceInfo)
      .input('res_cont_code', sql.VarChar(20), data.res_cont_code)
      .input('res_mob', sql.VarChar(50), data.res_mob)
      .input('res_email', sql.VarChar(500), data.res_email ?? null)
      .input('res_name', sql.VarChar(500), data.res_name)
      .input('res_relation', sql.VarChar(500), data.res_relation)
      .execute('dbo.USP_User_Add_Family');
    // Return the HTTP status and JSON response from the first row.
    if (!result.recordset?.length) {
      return null;
    }
    return result.recordset[0];
  } catch (error) {
    // Log database errors and forward them to the service.
    console.error('USP_User_Add_Family error:', error);
    throw error;
  }
}
}