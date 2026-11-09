import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import {KycDocumentsDto,KycUploadDto,} from '../dto/kyc.dto';
import { KycService } from '../Service/kyc.service';
@Controller('kyc')
export class KycController {
  constructor(
    private readonly kycService: KycService,
  ) {}
@Get('documents')
@HttpCode(HttpStatus.OK)
async getKycDocuments(
  @Query() dto: KycDocumentsDto,
) {
  return this.kycService.getKycDocuments(
    dto.user_token,
  );
}
/**
 * Fetches the KYC documents already uploaded by the user.
 *
 * The request token, IP address, and user-agent are passed
 * to the stored procedure through the service layer.
 */
@Get('user-documents')
@HttpCode(HttpStatus.OK)
async getUserKycDocuments(
  @Query() dto: KycDocumentsDto,
  @Req() req: FastifyRequest,
) {
  // Capture request metadata required by the stored procedure.
  const ipAddress = req.ip || '';
  const userAgent =
    req.headers['user-agent']?.toString() || '';
  return this.kycService.getUserKycDocuments(
    dto.user_token,
    ipAddress,
    userAgent,
  );
}
  @Post('upload')
async uploadKycDocument(
  @Req() req: FastifyRequest,
) {
  const file = await req.file();
  if (!file) {
    return this.kycService.uploadKycDocument(
      {
        user_id: '',
        doc_id: '',
      },
      undefined,
      req,
    );
  }
  const userIdField = file.fields.user_id;
  const docIdField = file.fields.doc_id;

  const userId =
    userIdField &&
    'value' in userIdField &&
    typeof userIdField.value === 'string'
      ? userIdField.value
      : '';

  const docId =
    docIdField &&
    'value' in docIdField &&
    typeof docIdField.value === 'string'
      ? docIdField.value
      : '';
  const dto: KycUploadDto = {
    user_id: userId,
    doc_id: docId,
  };
  return this.kycService.uploadKycDocument(
    dto,
    file,
    req,
  );
}
@Post('re-upload')
@HttpCode(HttpStatus.OK)
async reUploadKycDocument(
  @Req() req: FastifyRequest,
) {
  const file = await (req as any).file();
  if (!file) {
    return this.kycService.reUploadKycDocument(
      {
        user_id: '',
        doc_id: '',
      },
      undefined,
      req,
    );
  }
  const userIdField = file.fields.user_id;
  const docIdField = file.fields.doc_id;
  const userId =
    userIdField &&
    'value' in userIdField &&
    typeof userIdField.value === 'string'
      ? userIdField.value
      : '';
  const docId =
    docIdField &&
    'value' in docIdField &&
    typeof docIdField.value === 'string'
      ? docIdField.value
      : '';
  const dto: KycUploadDto = {
    user_id: userId,
    doc_id: docId,
  };
  return this.kycService.reUploadKycDocument(
    dto,
    file,
    req,
  );
}
}