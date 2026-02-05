import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { AuthService } from './auth.service';

export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
}

export class GoogleLoginDto {
  idToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Post('register')
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
    @Body() registerDto: RegisterDto,
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
      return { message: 'Token gerekli' };
    }

    // Check if the header starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return { message: 'Geçersiz token formatı. Bearer token gerekli.' };
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return { message: 'Token boş olamaz' };
    }

    return this.authService.me(token);
  }

  @Get('test')
  async test() {
    return { message: 'Test endpoint working' };
  }

  @Get('test-jwt')
  async testJwt() {
    // Create a test token
    const testPayload = {
      email: 'test@example.com',
      username: 'testuser',
      sub: 1,
      role: 'user',
    };

    try {
      // Use the auth service to create a token
      const result = await this.authService.login(testPayload);
      return {
        message: 'JWT test successful',
        token: result.access_token,
        secret: process.env.JWT_SECRET ? 'Set' : 'Not set (using default)',
      };
    } catch (error) {
      return {
        message: 'JWT test failed',
        error: error.message,
      };
    }
  }

  @Post('callback/credentials')
  async nextAuthCallback(@Body() body: any) {
    try {
      const { email, password } = body;

      if (!email || !password) {
        return {
          error: 'CredentialsSignin',
          message: 'Email ve şifre gereklidir',
          ok: false,
          status: 401,
        };
      }

      const user = await this.authService.validateUser(email, password);
      const loginResult = await this.authService.login(user);

      return {
        ok: true,
        user: loginResult.user,
        access_token: loginResult.access_token,
      };
    } catch (error) {
      console.log('Error in nextAuthCallback:', error);
      // Hata mesajını döndür
      return {
        error: 'CredentialsSignin',
        message: error.message || 'Giriş başarısız',
        ok: false,
        status: 401,
      };
    }
  }

  @Post('callback/google')
  async googleCallback(@Body() body: GoogleLoginDto) {
    const { idToken } = body || {};
    return this.authService.loginWithGoogleIdToken(idToken);
  }
}
