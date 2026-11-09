import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,Body,Post,Res,UsePipes,ValidationPipe
} from '@nestjs/common';
import { FastifyRequest,FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { mkdir,unlink } from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { extname,join } from 'path';
import { plainToInstance } from 'class-transformer';
import { validate,ValidationError } from 'class-validator';
import { PetService } from '../Service/pet.service';
import { AddPetDto } from '../dto/pet.dto';

@Controller('pet')
export class PetController {
  constructor(
    private readonly petService: PetService,
  ) {}
  /**
   * Retrieves reference data required by the Add Pet screen.
   * GET /pet/add-pet?user_token=YOUR_SESSION_TOKEN
   */
  @Get('add-pet')
  @HttpCode(HttpStatus.OK)
  async getAddPetReferenceData(
    @Query('user_token') userToken: string | undefined,
    @Req() req: FastifyRequest,
  ): Promise<Record<string, unknown>> {
    // Supply empty strings when metadata is unavailable so the
    // stored procedure can generate its standardized validation response.
    const ipAddress = req.ip || '';
    const deviceInfo =
      req.headers['user-agent']?.toString() || '';
    return this.petService.getAddPetReferenceData(
      userToken ?? '',
      ipAddress,
      deviceInfo,
    );
  }
   @Post('adding-pet-details')
async addPet(@Req() 
req: FastifyRequest, 
@Res() reply: FastifyReply) {
  // Stores the uploaded file path so we can delete it if an error occurs.
  let savedFile: string | undefined;
  try {
    // Extract the Bearer token from the Authorization header.
    const token =
      req.headers.authorization
        ?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || '';
    // Return 401 if the authentication token is missing.
    if (!token) {
      return reply.code(401).send({
        success: false,
        status: 401,
        error: {
          code: 'TOKEN_REQUIRED',
          message: 'Authentication token is required.',
          field: 'user_token',
        },
      });
    }
    // Stores the text fields received through multipart/form-data.
    const fields: Record<string, string> = {};
    // Tracks whether a pet picture has been uploaded.
    let fileFound = false;
    // Define the directory where pet images will be saved.
    const dir = join(process.cwd(), 'uploads', 'pets');
    // Create the upload directory if it does not already exist.
    await mkdir(dir, { recursive: true });
    // Read each field and file from the multipart request.
    for await (const part of req.parts()) {
      // Handle uploaded files.
      if (part.type === 'file') {
        // Accept only one file, and only in the petpicture field.
        if (part.fieldname !== 'petpicture' || fileFound) {
          part.file.resume(); // Discard the invalid file stream.
          throw new Error('Invalid file field.');
        }
        fileFound = true;
        // Extract the uploaded file's extension.
        const ext = extname(part.filename).toLowerCase();
        // Allow only supported image extensions and MIME types.
        if (
          !['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ||
          !['image/jpeg', 'image/png', 'image/webp'].includes(part.mimetype)
        ) {
          part.file.resume(); // Discard the invalid file stream.
          throw new Error('Invalid image type.');
        }
        // Generate a unique filename to prevent filename collisions.
        savedFile = join(dir, `${randomUUID()}${ext}`);
        // Save the uploaded image to the server.
        await pipeline(
          part.file,
          createWriteStream(savedFile, { flags: 'wx' }),
        );
        // Check whether the upload exceeded the configured file-size limit.
        if (part.file.truncated) {
          await unlink(savedFile).catch(() => undefined);
          savedFile = undefined;
          throw new Error('Image exceeds the upload limit.');
        }
        // Store the relative file path for the DTO and database procedure.
        fields.petpicture =
          `uploads/pets/${savedFile.split(/[\\/]/).pop()}`;
      } else {
        // Store regular text fields, such as petname and petcolour.
        fields[part.fieldname] = String(part.value ?? '');
      }
    }
    // Reject the request if the required pet picture was not uploaded.
    if (!fileFound) {
      return reply.code(400).send({
        success: false,
        status: 400,
        error: {
          code: 'PET_PICTURE_REQUIRED',
          message: 'Pet picture is required.',
          field: 'petpicture',
        },
      });
    }
    // Convert the received fields into an AddPetDto instance.
    const data = plainToInstance(AddPetDto, fields);
    // Validate the DTO according to its class-validator decorators.
    const errors = await validate(data);
    // Return validation errors if any fields are invalid.
    if (errors.length) {
      // Remove the uploaded file because the request is invalid.
      if (savedFile) {
        await unlink(savedFile).catch(() => undefined);
      }
      return reply.code(400).send({
        success: false,
        status: 400,
        errors: errors.map((e: ValidationError) => ({
          field: e.property,
          constraints: e.constraints,
        })),
      });
    }
    // Call the service to execute the pet-creation business logic.
    // Pass the token, client IP, user agent, and validated pet details.
    const result = await this.petService.addPet(
      token,
      req.ip || '',
      req.headers['user-agent']?.toString() || '',
      data,
    );
    // If the service reports a server error, remove the uploaded image.
    if (result.statusCode >= 500 && savedFile) {
      await unlink(savedFile).catch(() => undefined);
    }
    // Return the status code and response generated by the service.
    return reply.code(result.statusCode).send(result.response);
  } catch (err) {
    // Log the error for debugging on the server.
    console.error('Add Pet error:', err);
    // Clean up the uploaded file if an error occurs.
    if (savedFile) {
      await unlink(savedFile).catch(() => undefined);
    }
    // Return a generic error response for multipart processing failures.
    return reply.code(400).send({
      success: false,
      status: 400,
      error: {
        code: 'INVALID_MULTIPART_REQUEST',
        message: 'Unable to process pet form or picture.',
        field: null,
      },
    });
  }
}
}
