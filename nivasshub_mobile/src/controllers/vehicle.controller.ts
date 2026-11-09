
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { VehicleService } from '../Service/vehicle.service';
import { AddVehicleDto } from '../dto/vehicle.dto';

@Controller()
export class VehicleController {
  constructor(
    private readonly vehicleService: VehicleService,
  ) {}
  /**
   * Retrieves vehicle brand master data.
   * GET /vehicle-brands
   */
  @Get('vehicle-brands')
  @HttpCode(HttpStatus.OK)
  async getVehicleBrands(
    @Headers('authorization') authorization: string | undefined,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const userToken = authorization?.startsWith('Bearer ')
      ? authorization.substring(7).trim()
      : authorization?.trim() ?? '';
    const ipAddress = req.ip || '';
    const deviceInfo = req.headers['user-agent']?.toString() || '';
    const response = await this.vehicleService.getVehicleBrands(
      userToken,
      ipAddress,
      deviceInfo,
    );
    reply.status(Number(response.statusCode));
    return response;
  }
  /**
   * Registers a vehicle for a resident.
   * POST /vehicle/add
   */
  @Post('vehicle/add')
  @HttpCode(HttpStatus.CREATED)
  async addVehicle(
    @Body() dto: AddVehicleDto,
    @Req() req: FastifyRequest,
  ) {
    const ipAddress = req.ip || '';
    const deviceInfo = req.headers['user-agent']?.toString() || '';
    return this.vehicleService.addVehicle(
      dto,
      ipAddress,
      deviceInfo,
    );
  }
}
