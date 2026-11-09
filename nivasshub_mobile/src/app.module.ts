import { Module } from '@nestjs/common';
import { LoginModule } from './module/login.module';
import { CountryModule } from './module/country.module';
import { RegisterModule } from './module/register.module';
import { SocietyModule } from './module/society.module';
import { OtpModule } from './module/otp.module';
import { MailModule } from './mail/mail.module';
import { KycModule } from './module/kyc.module';
import { VehicleModule } from './module/vehicle.module';
import { AddFamilyModule } from './module/family.module';
import { PetModule } from './module/pet.module';
import { UserProfileModule } from './module/userprofile.module';
/**
 * Root application module.
 * Imports and registers the feature modules used
 * throughout the NestJS application.
 */
@Module({
  // Registers the CountryModule and makes its
  // controller and service available to the application.
  imports: [
    LoginModule,
    CountryModule,
    RegisterModule,
    SocietyModule,
    OtpModule,
    MailModule,
    KycModule,
    VehicleModule,
    AddFamilyModule,
    PetModule,UserProfileModule
  ],
})
export class AppModule {}
 