import { Module } from '@nestjs/common';
import { LoginController } from '../controllers/login.controller';
import { LoginRepository } from '../repositories/login.repository';
import { LoginService } from '../Service/login.service';
/** Groups the login controller, service, and repository. */
@Module({
  controllers: [LoginController],
  providers: [LoginService, LoginRepository],
})
export class LoginModule {}
