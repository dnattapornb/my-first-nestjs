import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Res,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');

    return { message: 'Logout successful' };
  }
}
