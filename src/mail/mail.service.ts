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
    const url = `${this.configService.get<string>('BASE_URL')}/auth/verify-email?token=${token}`;

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

  async sendPasswordReset(user: User, token: string) {
    const url = `${this.configService.get<string>('BASE_URL')}/auth/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: user.email,
      subject: 'Your Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Please click the link below to set a new password:</p>
        <a href="${url}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `,
    });
  }
}
