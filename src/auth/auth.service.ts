import {
  Injectable,
  UnauthorizedException,
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
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private databaseService: DatabaseService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.usersService.create(createUserDto);
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.databaseService.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // await this.mailService.sendUserConfirmation(user, token);

    return {
      message: 'Registration successful. Please check your email to verify your account.'
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && user.isVerified && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;

      return result;
    }

    return null;
  }

  async verifyEmail(token: string): Promise<User> {
    const verificationToken = await this.databaseService.verificationToken.findUnique({
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

    console.log(verificationToken);

    const user = await this.databaseService.user.update({
      where: { id: verificationToken.userId },
      data: { isVerified: true },
    });
    await this.databaseService.verificationToken.delete({ where: { id: verificationToken.id } });

    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      uuid: user.uuid,
      email: user.email
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
