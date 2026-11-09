import { IsNotEmpty, IsString,IsEmail,IsOptional,Matches,MaxLength} from 'class-validator';

export class GetFamilyRelationsDto {
  @IsString()
  @IsNotEmpty()
  user_token: string;
}
export class UserAddFamilyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  res_cont_code: string;
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/, {
    message: 'Mobile number must contain exactly 10 digits.',
  })
  res_mob: string;
  @IsOptional()
  @IsEmail()
  @MaxLength(500)
  res_email?: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  res_name: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  res_relation: string;
}