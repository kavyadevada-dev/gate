import { Module } from "@nestjs/common";
import { RegisterController } from "../controllers/register.controller";
import { RegisterRepository } from "../repositories/register.repository";
import { RegisterService } from "../Service/register.service";
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [MailModule],
    controllers:[RegisterController],
    providers:[RegisterService,RegisterRepository],
})
export class RegisterModule{}
