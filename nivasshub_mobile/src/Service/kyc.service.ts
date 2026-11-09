import {HttpException,Injectable,InternalServerErrorException,BadRequestException,} from '@nestjs/common';
import {KycDocumentsDto,KycUploadDto,} from '../dto/kyc.dto';
import { KycRepository } from '../repositories/kyc.repository';
import { MultipartFile } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';
/**
 * Response structure returned by
 * dbo.USP_User_Registration_KYC_GET.
 */
export interface KycProcedureResponse {
  statusCode: number;
  status: string;
  message: string;
  data: unknown[];
}
/**
 * Response structure returned by
 * dbo.USP_User_KYC_Upload.
 */
export interface KycUploadProcedureResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    documentName: string;
    version: number;
    actionPerformed: string;
  } | null;
}
@Injectable()
export class KycService {
  constructor(
    private readonly kycRepository: KycRepository,
  ) {}
  /**
   * Fetch KYC documents applicable to the user.
   */
  async getKycDocuments(
  userToken: string,
) {
  try {
    const result =
      await this.kycRepository.getKycDocuments(
        userToken,
      );

    if (!result) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        status: 'error',
        message:
          'An unexpected error occurred while fetching KYC documents.',
        data: null,
      });
    }
    let response;
    try {
      response = JSON.parse(result);
    } catch {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        status: 'error',
        message:
          'Invalid response received from KYC document procedure.',
        data: null,
      });
    }
    if (
      !response ||
      typeof response.statusCode !== 'number'
    ) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        status: 'error',
        message:
          'Invalid KYC document response.',
        data: null,
      });
    }

    // 200 is successful, including data: [].
    if (response.statusCode === 200) {
      return response;
    }

    // Preserve the status code returned by the SP.
    throw new HttpException(
      response,
      response.statusCode,
    );
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException({
      success: false,
      statusCode: 500,
      status: 'error',
      message:
        'An unexpected error occurred while fetching KYC documents.',
      data: null,
    });
  }
}

/**
 * Fetches KYC documents already uploaded by the user.
 *
 * The stored procedure validates the user token,
 * retrieves the uploaded KYC documents, and rotates
 * the session token on successful retrieval.
 */
async getUserKycDocuments(
  userToken: string,
  ipAddress: string,
  userAgent: string,
) {
  try {
    // Execute the stored procedure through the repository.
    const result =
      await this.kycRepository.getUserKycDocuments(
        userToken,
        ipAddress,
        userAgent,
      );

    // No response from the stored procedure.
    if (!result) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        status: 'error',
        message:
          'An unexpected error occurred while fetching user KYC documents.',
        data: null,
      });
    }

    let response;

    // Parse the JSON response returned by SQL Server.
    try {
      response = JSON.parse(result);
    } catch {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        status: 'error',
        message:
          'Invalid response received from user KYC document procedure.',
        data: null,
      });
    }

    // Validate the procedure response structure.
    if (
      !response ||
      typeof response.statusCode !== 'number'
    ) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        status: 'error',
        message:
          'Invalid user KYC document response.',
        data: null,
      });
    }

    // Return successful responses directly to the client.
    if (response.statusCode === 200) {
      return response;
    }

    // Convert stored-procedure errors into the
    // corresponding HTTP response.
    throw new HttpException(
      response,
      response.statusCode,
    );
  } catch (error) {
    // Preserve HTTP exceptions generated above.
    if (error instanceof HttpException) {
      throw error;
    }

    // Convert unexpected errors into a safe 500 response.
    throw new InternalServerErrorException({
      success: false,
      statusCode: 500,
      status: 'error',
      message:
        'An unexpected error occurred while fetching user KYC documents.',
      data: null,
    });
  }
}
  /**
   * Upload  a KYC document.
   * The stored procedure determines whether the operation
   * is an insert or re-upload and manages the document version.
   */
 async uploadKycDocument(
  dto: KycUploadDto,
  file: MultipartFile | undefined,
  req: FastifyRequest,
){
  try {
    if (!file) {
  throw new BadRequestException({
    success: false,
    statusCode: 400,
    message: 'KYC document file is required.',
    data: null,
  });
}
  const ipAddress = req.ip || '';
  const userAgent =
    req.headers['user-agent']?.toString() || '';
    const documentBuffer = await file.toBuffer();
  const result =
    await this.kycRepository.uploadKycDocument(
      dto.user_id,
      dto.doc_id,
      documentBuffer,
      ipAddress,
      userAgent,
    );
  if (!result) {
    throw new InternalServerErrorException({
      success: false,
      statusCode: 500,
      message:
        'An unexpected error occurred while uploading the KYC document.',
      data: null,
    });
  }
    let response;
    try {
      response = JSON.parse(result);
    } catch {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        message:
          'Invalid response received from KYC upload procedure.',
        data: null,
      });
    }
    if (
      !response ||
      typeof response.statusCode !== 'number'
    ) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        message:
          'Invalid KYC upload response.',
        data: null,
      });
    }
    // 200 = existing document re-uploaded successfully.
    // 201 = new document uploaded successfully.
    if (
      response.statusCode === 200 ||
      response.statusCode === 201
    ) {
      return response;
    }
    // Preserve validation/business errors returned by the SP.
    throw new HttpException(
      response,
      response.statusCode,
    );
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new InternalServerErrorException({
      success: false,
      statusCode: 500,
      message:
        'An unexpected error occurred while uploading the KYC document.',
      data: null,
    });
  }
}
/**
 * Re-upload an existing KYC document.
 *
 * Request type:
 * multipart/form-data
 *
 * Fields:
 * user_id - Text
 * doc_id  - Text
 * file    - File
 */
async reUploadKycDocument(
  dto: KycUploadDto,
  file: MultipartFile | undefined,
  req: FastifyRequest,
) {
  try {
    // File is mandatory
    if (!file) {
      throw new BadRequestException({
        success: false,
        statusCode: 400,
        message: 'KYC document file is required.',
        data: null,
      });
    }
    // Validate user ID
    if (!dto.user_id) {
      throw new BadRequestException({
        success: false,
        statusCode: 400,
        message: 'user_id is required.',
        data: null,
      });
    }
    // Validate document ID
    if (!dto.doc_id) {
      throw new BadRequestException({
        success: false,
        statusCode: 400,
        message: 'doc_id is required.',
        data: null,
      });
    }
    // Get IP address
    const ipAddress = req.ip || '';
    // Get User-Agent
    const userAgent =
      req.headers['user-agent']?.toString() || '';
    /*
     * Save the uploaded file.
     *
     * We use the existing file.toBuffer()
     * so the request remains multipart/form-data.
     */
    const documentBuffer =
      await file.toBuffer();
    /*
     * Generate a file name.
     */
    const originalName =
      file.filename || 'kyc-document';
    const safeFileName =
      `${Date.now()}_${originalName}`;
    /*
     * For the separate re-upload SP,
     * doc_url is VARCHAR(MAX).
     *
     * Therefore we generate a URL and
     * send that URL to the SP.
     *
     * Make sure your application serves
     * the uploads folder.
     */
    const docUrl =
      `http://localhost:3000/uploads/kyc/${safeFileName}`;

    console.log(
      'KYC Re-Upload Details:',
      {
        userId: dto.user_id,
        docId: dto.doc_id,
        fileName: originalName,
        fileSize: documentBuffer.length,
        docUrl,
        ipAddress,
        userAgent,
      },
    );
    /*
     * Execute the re-upload stored procedure.
     */
    const result =
  await this.kycRepository.reUploadKycDocument(
    dto.user_id,
    dto.doc_id,
    documentBuffer,
    ipAddress,
    userAgent,
  );
    // No SP response
    if (!result) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        message:
          'An unexpected error occurred while re-uploading the KYC document.',
        data: null,
      });
    }
    let response;

    // Parse SP JSON response
    try {
      response = JSON.parse(result);
    } catch {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        message:
          'Invalid response received from KYC re-upload procedure.',
        data: null,
      });
    }
    // Validate response
    if (
      !response ||
      typeof response.statusCode !== 'number'
    ) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        message:
          'Invalid KYC re-upload response.',
        data: null,
      });
    }
    /*
     * Successful re-upload
     */
    if (
      response.statusCode === 200
    ) {
      return response;
    }
    /*
     * Preserve SP business errors
     *
     * Example:
     * 400 validation
     * 401 invalid token
     * 404 document not found
     * 409 pending
     * 500 database error
     */
    throw new HttpException(
      response,
      response.statusCode,
    );
  } catch (error) {
    // Preserve NestJS HTTP exceptions
    if (error instanceof HttpException) {
      throw error;
    }
    throw new InternalServerErrorException({
      success: false,
      statusCode: 500,
      message:
        'An unexpected error occurred while re-uploading the KYC document.',
      data: null,
    });
  }
}
}