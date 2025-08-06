import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendUserConfirmation(user: User, token: string) {
    // TODO: This should get URL from .env
    const url = `http://127.0.0.1:3000/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: user.email,
      subject: 'Welcome to My First NestJS App! Please Confirm Your Email',
      html: `
        <h1>Welcome, ${user.firstName}!</h1>
        <p>Thank you for registering. Please click the link below to verify your email address:</p>
        <a href="${url}">Verify Email</a>
        <p>If you did not create an account, no further action is required.</p>
      `,
    });
  }
}
