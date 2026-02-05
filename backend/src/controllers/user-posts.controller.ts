import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserPostsService } from '../services/user-posts.service';
import { CreateUserPostDto } from '../dto/user-posts/create-user-post.dto';
import { UpdateUserPostDto } from '../dto/user-posts/update-user-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as fs from 'fs';

function fileFilter(req, file, cb) {
  const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif'];
  const allowedVideoTypes = ['.mp4', '.mov', '.avi', '.webm'];
  const ext = extname(file.originalname).toLowerCase();
  if ([...allowedImageTypes, ...allowedVideoTypes].includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException('Sadece resim veya video yükleyebilirsiniz.'),
      false,
    );
  }
}

function destination(req, file, cb) {
  const ext = extname(file.originalname).toLowerCase();
  const isImage = ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
  const isVideo = ['.mp4', '.mov', '.avi', '.webm'].includes(ext);
  let uploadPath = '';
  if (isImage) {
    uploadPath = 'uploads/user_posts_img';
  } else if (isVideo) {
    uploadPath = 'uploads/user_posts_videos';
  }
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  cb(null, uploadPath);
}

function filename(req, file, cb) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  cb(null, uniqueSuffix + extname(file.originalname));
}

@Controller('user-posts')
export class UserPostsController {
  constructor(private readonly userPostsService: UserPostsService) { }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination, filename }),
      fileFilter,
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB video limiti
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateUserPostDto,
  ) {
    let filePath: string | null = null;
    if (file) {
      // Dosya yolu yerine URL formatında kaydet
      const ext = extname(file.originalname).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
      const isVideo = ['.mp4', '.mov', '.avi', '.webm'].includes(ext);

      if (isImage) {
        filePath = `/uploads/user_posts_img/${file.filename}`;
      } else if (isVideo) {
        filePath = `/uploads/user_posts_videos/${file.filename}`;
      }

      // Eğer video ise boyut kontrolü (multer zaten limits ile kontrol ediyor)
      if (isVideo && file.size > 100 * 1024 * 1024) {
        // Fazla büyükse dosyayı sil
        fs.unlinkSync(file.path);
        throw new BadRequestException('Video dosyası 100MB geçemez.');
      }
    }

    // Fotoğraf ise image_url, video ise video_url olarak kaydet
    const payload: any = { ...body };
    if (file) {
      const ext = extname(file.originalname).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        payload.image_url = filePath;
      } else if (['.mp4', '.mov', '.avi', '.webm'].includes(ext)) {
        payload.video_url = filePath;
      }
    }

    return this.userPostsService.create(payload);
  }

  @Get()
  findAll() {
    return this.userPostsService.findAll();
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  getUserPosts(@Param('userId', ParseIntPipe) userId: number, @Request() req) {
    const currentUserId = req.user?.id;
    // Eğer kullanıcı kendi postlarını görüyorsa, pending olanları da göster
    const includePending =
      currentUserId && Number(currentUserId) === Number(userId);
    return this.userPostsService.getUserPosts(userId, includePending);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.userPostsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateUserPostDto: UpdateUserPostDto,
  ) {
    return this.userPostsService.update(id, updateUserPostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userPostsService.remove(id);
  }

  @Get('timeline/:userId')
  getTimeline(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('language') language?: string,
  ) {
    return this.userPostsService.getTimeline(userId, language);
  }

  @Get('shared-profile/:profileType/:profileId')
  getSharedProfileData(
    @Param('profileType') profileType: string,
    @Param('profileId', ParseIntPipe) profileId: number,
  ) {
    return this.userPostsService.getSharedProfileData(profileType, profileId);
  }

  // Admin endpoints
  @Get('admin/pending')
  @UseGuards(JwtAuthGuard)
  getPendingPosts(@Request() req) {
    // Admin kontrolü yapılabilir - şimdilik sadece JWT guard yeterli
    return this.userPostsService.getPendingPosts();
  }

  @Patch('admin/:id/approve')
  @UseGuards(JwtAuthGuard)
  approvePost(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const adminUserId = req.user?.id;
    if (!adminUserId) {
      throw new BadRequestException('Admin user ID not found');
    }
    return this.userPostsService.approvePost(id, adminUserId);
  }

  @Patch('admin/:id/reject')
  @UseGuards(JwtAuthGuard)
  rejectPost(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const adminUserId = req.user?.id;
    if (!adminUserId) {
      throw new BadRequestException('Admin user ID not found');
    }
    return this.userPostsService.rejectPost(id, adminUserId);
  }
}
