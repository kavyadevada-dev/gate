
import {
  Body,
  Post,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Query,
  Headers,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import {
  SocietyDetailsDto,
  AddSocietyMasterDataDto,
  AddUserToSocietyDto,
} from '../dto/society.dto';
import { SocietyService } from '../Service/society.service';

/**
 * Controller responsible for Society-related APIs.
 */
@Controller('society')
export class SocietyController {
  constructor(
    private readonly societyService: SocietyService,
  ) {}

  /**
   * GET /society/details?socid=33
   */
  @Get('details')
  @HttpCode(HttpStatus.OK)
  async getSocietyDetails(
    @Query() dto: SocietyDetailsDto,
  ) {
    return this.societyService.getSocietyDetails(dto);
  }

  /**
   * GET /society/add-master-data?user_token=YOUR_SESSION_TOKEN
   */
  @Get('add-master-data')
  @HttpCode(HttpStatus.OK)
  async getAddSocietyMasterData(
    @Query() dto: AddSocietyMasterDataDto,
    @Req() req: FastifyRequest,
  ) {
    const ipAddress = req.ip || '';
    const deviceInfo =
      req.headers['user-agent']?.toString() || '';

    return this.societyService.getAddSocietyMasterData(
      dto.user_token,
      ipAddress,
      deviceInfo,
    );
  }

  /**
   * POST /society/add-user
   */
  @Post('add-user')
  @HttpCode(HttpStatus.CREATED)
  async addUserToSociety(
    @Body() dto: AddUserToSocietyDto,
    @Req() req: FastifyRequest,
  ) {
    const ipAddress = req.ip || '';
    const deviceInfo =
      req.headers['user-agent']?.toString() || '';

    return this.societyService.addUserToSociety(
      dto,
      ipAddress,
      deviceInfo,
    );
  }

  /**
   * GET /society/countries-states-societies
   */
  @Get('countries-states-societies')
  @HttpCode(HttpStatus.OK)
  async getCountriesStatesSocieties(
    @Headers('authorization') authorization: string,
  ) {
    const sessionToken = authorization?.startsWith('Bearer ')
      ? authorization.substring(7)
      : authorization;

    return this.societyService.getCountriesStatesSocieties(
      sessionToken,
    );
  }
}
