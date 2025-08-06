import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Res,
  UseGuards,
  Get,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { access_token } = await this.authService.login(user);

    response.cookie('access_token', access_token, {
      httpOnly: true, // [EN] Prevents access from JavaScript
      // secure: process.env.NODE_ENV === 'production', // [EN] Only send the cookie over HTTPS in production
      // sameSite: 'strict',  // [EN] Protects against CSRF
      // expires: new Date(Date.now() + 3600 * 1000), // [EN] Set the expiration time to match the JWT
    });

    return { message: 'Login successful' };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() response: Response) {
    const user = await this.authService.verifyEmail(token);

    const { access_token } = await this.authService.login(user);

    response.cookie('access_token', access_token, {
      httpOnly: true, // [EN] Prevents access from JavaScript
      // secure: process.env.NODE_ENV === 'production', // [EN] Only send the cookie over HTTPS in production
      // sameSite: 'strict',  // [EN] Protects against CSRF
      // expires: new Date(Date.now() + 3600 * 1000), // [EN] Set the expiration time to match the JWT
    });

    // TODO: This should redirect to a frontend URL from .env
    // http://127.0.0.1:3000/users/profile
    response.redirect('/users/profile');
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');

    return { message: 'Logout successful' };
  }
}
