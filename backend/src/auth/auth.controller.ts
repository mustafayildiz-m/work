import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ValidationPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  GoogleLoginDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';

export { LoginDto, RegisterDto, GoogleLoginDto } from './dto/auth.dto';

// Sadece DTO'da tanımlı alanları kabul et, fazlalıkları at
const bodyValidation = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidUnknownValues: false,
});

// Brute-force koruması: hassas uçlar için dakikada 10 deneme
const LOGIN_THROTTLE = { default: { limit: 10, ttl: 60_000 } };
// Kayıt / mail gönderen uçlar için saatte 5 deneme
const MAIL_THROTTLE = { default: { limit: 5, ttl: 60 * 60_000 } };

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle(LOGIN_THROTTLE)
  async login(@Body(bodyValidation) loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user, loginDto.rememberMe);
  }

  @Post('register')
  @Throttle(MAIL_THROTTLE)
  @UseInterceptors(
    FileInterceptor('profilePhoto', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = 'uploads';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async register(
    @Body(bodyValidation) registerDto: RegisterDto,
    @UploadedFile() profilePhoto: Express.Multer.File,
  ) {
    // Eğer profil fotoğrafı yüklendiyse, dosya yolunu ayarla
    if (profilePhoto) {
      registerDto.photoUrl = `/uploads/${profilePhoto.filename}`;
    }

    return this.authService.register(registerDto);
  }

  @Get('me')
  async me(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Token gerekli');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Geçersiz token formatı. Bearer token gerekli.',
      );
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Token boş olamaz');
    }

    return this.authService.me(token);
  }

  @Post('callback/credentials')
  @Throttle(LOGIN_THROTTLE)
  async nextAuthCallback(@Body(bodyValidation) body: LoginDto) {
    try {
      const user = await this.authService.validateUser(
        body.email,
        body.password,
      );
      const loginResult = await this.authService.login(user, body.rememberMe);

      return {
        ok: true,
        user: loginResult.user,
        access_token: loginResult.access_token,
      };
    } catch (error) {
      // NextAuth authorize() hata mesajını gövdeden okur, bu yüzden 200 ile dönülür
      return {
        error: 'CredentialsSignin',
        message: error.message || 'Giriş başarısız',
        ok: false,
        status: 401,
      };
    }
  }

  @Post('callback/google')
  @Throttle(LOGIN_THROTTLE)
  async googleCallback(@Body(bodyValidation) body: GoogleLoginDto) {
    return this.authService.loginWithGoogleIdToken(body.idToken);
  }

  @Get('verify')
  async verifyEmail(
    @Query('token') queryToken: string,
    @Headers('token') headerToken: string,
  ) {
    const token = queryToken || headerToken;
    if (!token) {
      throw new UnauthorizedException('Doğrulama tokenı gerekli');
    }
    return this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
  @Throttle(MAIL_THROTTLE)
  async forgotPassword(@Body(bodyValidation) body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @Throttle(LOGIN_THROTTLE)
  async resetPassword(@Body(bodyValidation) body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.password);
  }
}
