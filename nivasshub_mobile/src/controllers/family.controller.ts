import {Body,
  Controller,
  Get,
  Req,Post,Res,HttpException,UsePipes,ValidationPipe
} from '@nestjs/common';
import type { Request,Response } from 'express';
import { AddFamilyService } from '../Service/family.service';
import { UserAddFamilyDto } from '../dto/family.dto';
@Controller('get-family')
export class AddFamilyController {
  constructor(
    private readonly addFamilyService: AddFamilyService,
  ) {}
  // Handle the GET request to retrieve family master data.
  @Get()
  async getAddFamilyMasterData(@Req() req: Request) {
    // Extract the session token from the Authorization header.
    const userToken =
      req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
    // Get the client's IP address from the request.
    const ipAddress = req.ip || '';
    // Get device information from the User-Agent header.
    const deviceInfo = String(req.headers['user-agent'] || '');
    // Call the service and return the family details response.
    return this.addFamilyService.getAddFamilyMasterData(
      userToken,
      ipAddress,
      deviceInfo,
    );
  }
@Post('add-family')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
async addFamilyMember(
  @Body() data: UserAddFamilyDto,
  @Req() req: Request,
) {
  // Get the bearer token
  const authHeader = req.headers.authorization;
  const userToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : '';
  // Get client IP and device information
  const ipAddress = req.ip ?? '';
  const deviceInfo = req.headers['user-agent'] ?? '';
  // Call service
  const result = await this.addFamilyService.addFamilyMember(
    userToken,
    ipAddress,
    deviceInfo,
    data,
  );
  // Return the response body
  return result.response;
}
}