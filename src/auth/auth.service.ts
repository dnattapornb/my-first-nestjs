import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '@prisma/client';
import {
  FIFTEEN_MINUTES_IN_MS,
  TWENTY_FOUR_HOURS_IN_MS,
} from './constants/auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private databaseService: DatabaseService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.usersService.create(createUserDto);
    const token = await this._createVerificationToken(user);
    await this.mailService.sendUserConfirmation(user, token);

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (
      user &&
      user.isVerified &&
      (await bcrypt.compare(pass, user.password))
    ) {
      const { password, ...result } = user;

      return result;
    }

    return null;
  }

  async verifyEmail(token: string): Promise<User> {
    const verificationToken =
      await this.databaseService.verificationToken.findUnique({
        where: { token },
        include: { user: true },
      });

    if (!verificationToken) {
      throw new NotFoundException('Invalid verification token.');
    }

    if (new Date() > verificationToken.expiresAt) {
      // TODO: Add logic to delete expired tokens or allow the user to request a new one.
      throw new BadRequestException('Verification token has expired.');
    }

    const user = await this.databaseService.user.update({
      where: { id: verificationToken.userId },
      data: { isVerified: true },
    });

    await this.databaseService.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
      permissions: user.permissions?.map((p) => `${p.action}:${p.subject}`) || [],
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const token = await this._createPasswordResetToken(user);
      await this.mailService.sendPasswordReset(user, token);
    }

    return {
      message:
        'If an account with that email exists, we have sent a password reset link.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    const resetToken = await this.databaseService.passwordResetToken.findUnique(
      {
        where: { token },
      },
    );

    if (!resetToken || new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.databaseService.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await this.databaseService.passwordResetToken.delete({
      where: { id: resetToken.id },
    });
  }

  private _generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async _createVerificationToken(user: User): Promise<string> {
    const token = this._generateSecureToken();
    const expiresAt = new Date(Date.now() + TWENTY_FOUR_HOURS_IN_MS);

    await this.databaseService.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    return token;
  }

  private async _createPasswordResetToken(user: User): Promise<string> {
    const token = this._generateSecureToken();
    const expiresAt = new Date(Date.now() + FIFTEEN_MINUTES_IN_MS);

    await this.databaseService.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    return token;
  }
}
