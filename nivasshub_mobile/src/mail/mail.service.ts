import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
/** * MailService is responsible for sending emails using the Nodemailer library.
 * It is designed to be used as a singleton service within the NestJS application.
 */
@Injectable()
export class MailService {
  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
/**
   * Sends a registration email to the specified user.
   * @param email - The recipient's email address.
   * @param name - The recipient's name.
   * @param otp - The OTP for email verification (optional).
   * This method constructs an HTML email template and sends it using the configured SMTP transporter.
   * It is designed to be called after a successful user registration.
   */
  async sendRegistrationEmail(
    email: string,
    name: string,
    otp?: string | number,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Welcome to NivaasaHub - Registration Successful',
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 20px;
        ">
          <h2>Welcome to NivaasaHub</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>
            Your registration has been successfully completed.
          </p>
          ${
            otp
              ? `
                <p>Your email verification OTP is:</p>
                <h2 style="letter-spacing: 5px;">
                  ${otp}
                </h2>
                <p>
                  Please use this OTP to verify your email address.
                </p>
              `
              : ''
          }
          <p>
            You can login using the link below:
          </p>
          <p>
            <a
              href="${process.env.FRONTEND_LOGIN_URL}"
              style="
                background: #007bff;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
              "
            >
              Login to NivaasaHub
            </a>
          </p>
          <br />
          <p>
            Regards,<br />
            <strong>${process.env.SMTP_FROM_NAME} Team</strong>
          </p>
        </div>
      `,
    });
  }
}