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
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ACCESS_TOKEN_COOKIE_NAME } from './constants/auth.constants';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken } = await this.authService.login(user);
    this._setAuthCookie(response, accessToken);

    return { message: 'Login successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(ACCESS_TOKEN_COOKIE_NAME);

    return { message: 'Logout successful' };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    const user = await this.authService.verifyEmail(token);
    const { accessToken } = await this.authService.login(user);
    this._setAuthCookie(res, accessToken);

    res.redirect(this.configService.get<string>('BASE_URL') + '/users/profile');
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return {
      message: 'Password has been reset successfully.',
    };
  }

  private _setAuthCookie(response: Response, accessToken: string) {
    // const expiresIn = this.configService.get<string>('JWT_EXPIRATION_TIME');
    // const expires = new Date(Date.now() + parseInt(expiresIn, 10) * 1000);

    response.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true, // Prevents direct access from client-side JavaScript (XSS protection).
      // secure: this.configService.get<string>('NODE_ENV') === 'production', // Only send the cookie over HTTPS in production.
      // sameSite: 'strict', // Protects against CSRF attacks.
      // expires: expires, // Set the cookie's expiration time to match the JWT.
    });
  }
}
