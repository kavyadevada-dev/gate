import { Injectable } from '@nestjs/common';
import { UserProfileRepository,UserProfileResponse,GetUserProfileParams } from '../repositories/userprofile.repository';
import { UserOwnPropertiesParams,UserOwnPropertiesResponse } from '../repositories/userprofile.repository';
import { from } from 'rxjs';
@Injectable()
export class UserProfileService {
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
  ) {}
  async getUserProfile(
    params: GetUserProfileParams,
  ): Promise<UserProfileResponse> {
    return await this.userProfileRepository.getUserProfile(params);
  }
  // Get User Own Properties
async getUserOwnProperties(
  params: UserOwnPropertiesParams,
): Promise<UserOwnPropertiesResponse> {
  // Call repository to execute stored procedure
  return await this.userProfileRepository.getUserOwnProperties(params);
}
}
