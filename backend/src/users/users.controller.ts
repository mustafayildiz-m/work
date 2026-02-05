import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from './entities/user.entity';
import { UserFollowService } from '../services/user-follow.service';
import { UserScholarFollowService } from '../services/user-scholar-follow.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userFollowService: UserFollowService,
    private readonly userScholarFollowService: UserScholarFollowService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // Get current user's info (me endpoint)
  @UseGuards(AuthGuard('jwt'))
  @Get('me/profile')
  async getMyProfile(@Request() req: any): Promise<User | null> {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.usersService.findOne(userId);
  }

  // Public endpoint for basic user info (for post sharing) - must be before :id route
  @Get('public/:id')
  async findOnePublic(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<User | (User & { isFollowing: boolean }) | null> {
    const requesterId = req?.user?.id as number | undefined;
    const user = await this.usersService.findOne(id);
    if (!user) return null;
    if (requesterId) {
      try {
        const followRecord = await this.userFollowService.findFollow(
          requesterId,
          id,
        );
        (user as any).isFollowing = !!followRecord;
      } catch (error) {
        (user as any).isFollowing = false;
      }
    } else {
      (user as any).isFollowing = false;
    }
    return user as any;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me/profile')
  async updateMyProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.usersService.updateProfile(userId, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me/change-password')
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    await this.usersService.changePassword(userId, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: Partial<CreateUserDto>,
  ): Promise<User | null> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/photo')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = 'uploads/profile_photos';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `user-${req.params.id}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              'Sadece resim dosyaları yükleyebilirsiniz (JPG, PNG, GIF, WebP)',
            ),
            false,
          );
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async updateProfilePhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() photo: Express.Multer.File,
    @Request() req: any,
  ): Promise<User | null> {
    // Sadece kendi profilini güncelleyebilir
    if (req.user.id !== id) {
      throw new Error('Bu profil resmini güncelleme yetkiniz yok');
    }

    const photoUrl = `/uploads/profile_photos/${photo.filename}`;
    return this.usersService.update(id, { photoUrl });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  // Belirli kullanıcının takip ettiği kullanıcılar
  @Get(':id/following')
  async getFollowingUsersOfUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;

    const [users, totalCount] = await Promise.all([
      this.userFollowService.getFollowingUsers(id, limitNumber, offsetNumber),
      this.userFollowService.getFollowingCount(id),
    ]);

    return {
      users,
      totalCount,
      hasMore: offsetNumber + limitNumber < totalCount,
    };
  }

  // Belirli kullanıcının takipçileri
  @Get(':id/followers')
  async getFollowersOfUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;

    const [users, totalCount] = await Promise.all([
      this.userFollowService.getFollowers(id, limitNumber, offsetNumber),
      this.userFollowService.getFollowersCount(id),
    ]);

    return {
      users,
      totalCount,
      hasMore: offsetNumber + limitNumber < totalCount,
    };
  }

  // Belirli kullanıcının takip istatistikleri
  @Get(':id/follow-stats')
  async getFollowStatsOfUser(@Param('id', ParseIntPipe) id: number) {
    const [followingCount, followersCount] = await Promise.all([
      this.userFollowService.getFollowingCount(id),
      this.userFollowService.getFollowersCount(id),
    ]);

    return {
      followingUsersCount: followingCount,
      followersCount,
    };
  }

  // Belirli kullanıcının takip ettiği alimler
  @Get(':id/following-scholars')
  async getFollowingScholarsOfUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;

    const [scholars, totalCount] = await Promise.all([
      this.userScholarFollowService.getFollowingScholars(
        id,
        limitNumber,
        offsetNumber,
      ),
      this.userScholarFollowService.getFollowingScholarsCount(id),
    ]);

    return {
      scholars,
      totalCount,
      hasMore: offsetNumber + limitNumber < totalCount,
    };
  }
}
