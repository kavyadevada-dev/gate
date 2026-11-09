import {
  Controller,
  Get,
  Headers,
  Query,
  Ip,
  Req,
  Res,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserProfileService } from '../Service/userprofile.service';
@Controller('user')
export class UserProfileController {
  constructor(
    private readonly userProfileService: UserProfileService,
  ) {}
  @Get('profile')
  async getUserProfile(
    @Headers('authorization') authorization: string,
    @Query('user_token') queryToken: string,
    @Ip() ipAddress: string,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    // 1. Extract token from Authorization Bearer header
    const bearerToken = authorization?.startsWith('Bearer ')
      ? authorization.substring(7).trim()
      : '';
    // 2. Support both Bearer token and URL query parameter
    // Bearer token gets priority if both are provided
    const userToken = bearerToken || queryToken?.trim() || '';

    // 3. Normalize client IP address
    let normalizedIp = (ipAddress || '').trim();
    // Convert IPv4-mapped IPv6 address to IPv4
    if (normalizedIp.startsWith('::ffff:')) {
      normalizedIp = normalizedIp.substring(7);
    }
    // Convert localhost IPv6 to IPv4
    if (normalizedIp === '::1') {
      normalizedIp = '127.0.0.1';
    }
    // 4. Collect device information from User-Agent
    const deviceInfo = (
      req.headers['user-agent'] || 'Unknown'
    ).substring(0, 250);
    // 5. Pass parameters to service and execute stored procedure
    const result = await this.userProfileService.getUserProfile({
      user_token: userToken,
      ipadd: normalizedIp,
      dinfo: deviceInfo,
    });
    // 6. Return stored procedure response with its HTTP status
    return reply.code(result.statusCode).send(result);
  }
  // Get User Own Properties
@Get('own-properties')
async getUserOwnProperties(
  @Headers('authorization') authorization: string,
  @Query('user_token') queryToken: string,
  @Ip() ipAddress: string,
  @Req() req: FastifyRequest,
  @Res() reply: FastifyReply,
) {
  // Get token from Bearer header or query parameter
  const token = authorization?.startsWith('Bearer ')
    ? authorization.substring(7).trim()
    : queryToken?.trim() || '';
  // Normalize client IP address
  const ipadd = (ipAddress || '')
    .replace('::ffff:', '')
    .replace('::1', '127.0.0.1');
  // Get device information
  const dinfo = (req.headers['user-agent'] || '').substring(0, 250);
  // Call service to execute stored procedure
  const result = await this.userProfileService.getUserOwnProperties({
    user_token: token,
    ipadd,
    dinfo,
  });
  // Return complete JSON response from stored procedure
  return reply.code(result.statusCode).send(result);
}
}