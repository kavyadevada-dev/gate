
import { Module } from '@nestjs/common';

import { UserProfileController } from '../controllers/userprofile.controller.js';
import { UserProfileService } from '../Service/userprofile.service.js';
import { UserProfileRepository } from '../repositories/userprofile.repository.js';

@Module({
  controllers: [
    UserProfileController,
  ],
  providers: [
    UserProfileService,
    UserProfileRepository,
  ],
  exports: [
    UserProfileService,
  ],
})
export class UserProfileModule {}
