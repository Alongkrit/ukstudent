import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const emailLower = dto.email.toLowerCase().trim();

    // Check duplicate email
    const existing = await this.prisma.user.findUnique({ where: { email: emailLower } });
    if (existing) {
      throw new ConflictException('An account with this email address already exists.');
    }

    // Password strength check
    if (dto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationCodeHash = crypto.createHash('sha256').update(verificationCode).digest('hex');

    const defaultNameFromEmail = emailLower.split('@')[0].replace('.', ' ');
    const formattedDefaultName = defaultNameFromEmail
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const user = await this.prisma.user.create({
      data: {
        email: emailLower,
        passwordHash,
        role: dto.role,
        emailVerificationCodeHash: verificationCodeHash,
        emailVerificationExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        ...(dto.role === 'student' && {
          studentProfile: {
            create: {
              fullName: dto.fullName || formattedDefaultName,
              university: dto.university || 'University',
              course: dto.course || 'General Studies',
              yearOfStudy: dto.yearOfStudy || 'First-Year',
            },
          },
        }),
        ...(dto.role === 'expert' && {
          expertProfile: {
            create: {
              subjects: dto.subjects || [],
              qualifications: dto.qualifications || 'Higher Education Degree',
              bio: dto.bio || '',
              paypalEmail: dto.paypalEmail || emailLower,
            },
          },
        }),
      },
    });

    console.log(`[DEV Verification Code] User: ${user.email} -> Code: ${verificationCode}`);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      message: 'Account created successfully.',
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const emailLower = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: emailLower } });

    if (!user || !user.emailVerificationCodeHash || !user.emailVerificationExpiresAt) {
      throw new UnauthorizedException('Invalid or expired verification code.');
    }

    if (user.emailVerificationExpiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired verification code.');
    }

    const codeHash = crypto.createHash('sha256').update(dto.code).digest('hex');
    if (codeHash !== user.emailVerificationCodeHash) {
      throw new UnauthorizedException('Invalid or expired verification code.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationCodeHash: null,
        emailVerificationExpiresAt: null,
      },
    });

    return { message: 'Email successfully verified.' };
  }

  async login(dto: LoginDto) {
    const emailLower = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: emailLower } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('This account was created with Google OAuth. Please sign in with Google.');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.issueTokens(user.id, user.role, user.email);
  }

  async googleLogin(dto: GoogleAuthDto) {
    let payload: any;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      console.error('Google token verification error:', err);
      throw new UnauthorizedException('Invalid Google OAuth credential.');
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedException('Could not retrieve email from Google OAuth.');
    }

    const emailLower = payload.email.toLowerCase().trim();
    const googleSub = payload.sub || emailLower;
    const name = payload.name || payload.given_name || emailLower.split('@')[0];

    let user = await this.prisma.user.findUnique({
      where: { email: emailLower },
      include: { studentProfile: true, expertProfile: true, oauthAccounts: true },
    });

    const isNewUser = !user;

    if (!user) {
      const role = (dto.role === 'expert' ? 'expert' : 'student') as any;
      user = await this.prisma.user.create({
        data: {
          email: emailLower,
          role,
          emailVerifiedAt: new Date(),
          ...(role === 'student' && {
            studentProfile: {
              create: {
                fullName: name,
                university: 'University',
                course: 'General Studies',
                yearOfStudy: 'First-Year',
              },
            },
          }),
          ...(role === 'expert' && {
            expertProfile: {
              create: {
                subjects: [],
                qualifications: 'Verified Expert',
                bio: '',
              },
            },
          }),
          oauthAccounts: {
            create: {
              provider: 'google',
              providerAccountId: googleSub,
            },
          },
        },
        include: { studentProfile: true, expertProfile: true, oauthAccounts: true },
      });
    } else {
      const hasGoogle = user.oauthAccounts.some((a) => a.provider === 'google');
      if (!hasGoogle) {
        await this.prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: 'google',
            providerAccountId: googleSub,
          },
        });
      }
    }

    return this.issueTokens(user.id, user.role, user.email, isNewUser);
  }

  private async issueTokens(userId: string, role: string, email: string, isNewUser = false) {
    const accessToken = this.jwt.sign({ sub: userId, role, email });

    const refreshTokenRaw = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');

    const expiresInDays = 30;
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
      user: { id: userId, role, email },
      isNewUser,
    };
  }

  async refreshWithToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided.');
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(stored.user.id, stored.user.role, stored.user.email);
  }

  async logout(userId: string, refreshToken: string) {
    if (!refreshToken) return { message: 'Logged out.' };

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await this.prisma.refreshToken.updateMany({
      where: { userId, tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Logged out.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const emailLower = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: emailLower } });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetTokenHash: resetTokenHash,
          passwordResetExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      console.log(`[DEV Password Reset Token] User: ${user.email} -> Token: ${resetToken}`);
    }

    return { message: 'If an account exists for this email, a reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token.');
    }

    if (dto.newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long.');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Password has been reset successfully.' };
  }
}
