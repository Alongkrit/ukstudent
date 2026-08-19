import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CsrfGuard } from '../../common/guards/csrf.guard';
import * as crypto from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Helper endpoint to issue CSRF cookie and return CSRF token
  @Get('csrf')
  getCsrfToken(@Res({ passthrough: true }) res: Response) {
    const csrfToken = crypto.randomBytes(24).toString('hex');
    this.setCsrfCookie(res, csrfToken);
    return { csrfToken };
  }

  @Post('register')
  @UseGuards(CsrfGuard)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-email')
  @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.login(dto);
    const csrfToken = crypto.randomBytes(24).toString('hex');
    this.setAuthCookies(res, refreshToken, csrfToken);
    return { accessToken, user };
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() dto: GoogleAuthDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user, isNewUser } = await this.authService.googleLogin(dto);
    const csrfToken = crypto.randomBytes(24).toString('hex');
    this.setAuthCookies(res, refreshToken, csrfToken);
    return { accessToken, user, isNewUser };
  }

  @Post('refresh')
  @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    const { accessToken, refreshToken: newRefreshToken, user } = await this.authService.refreshWithToken(refreshToken);
    const csrfToken = crypto.randomBytes(24).toString('hex');
    this.setAuthCookies(res, newRefreshToken, csrfToken);
    return { accessToken, user };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, CsrfGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    await this.authService.logout(user.id, refreshToken);
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    res.clearCookie('csrfToken', { path: '/' });
  }

  private setCsrfCookie(res: Response, csrfToken: string) {
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  private setAuthCookies(res: Response, refreshToken: string, csrfToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    this.setCsrfCookie(res, csrfToken);
  }

  @Post('forgot-password')
  @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
