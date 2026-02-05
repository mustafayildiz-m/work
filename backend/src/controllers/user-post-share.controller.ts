import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Request,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPostShareService } from '../services/user-post-share.service';

@Controller('user-post-shares')
@UseGuards(JwtAuthGuard)
export class UserPostShareController {
  constructor(private readonly userPostShareService: UserPostShareService) {}

  // Gönderi paylaş
  @Post()
  async sharePost(
    @Body() body: { post_id: string; post_type?: number | string },
    @Request() req: any,
  ) {
    const userId = req.user.id;
    // Convert to proper type: 1 or '1' = 'scholar', 2 or '2' or 'user' = 'user'
    let postType: 'user' | 'scholar' = 'user';
    if (body.post_type === 1 || body.post_type === '1') {
      postType = 'scholar';
    } else if (
      body.post_type === 2 ||
      body.post_type === '2' ||
      body.post_type === 'user'
    ) {
      postType = 'user';
    }
    return await this.userPostShareService.sharePost(
      userId,
      body.post_id,
      postType,
    );
  }

  // Paylaşımı kaldır
  @Delete(':postId')
  async unsharePost(
    @Param('postId') postId: string,
    @Query('post_type') postTypeParam: string = 'user',
    @Request() req: any,
  ) {
    const userId = req.user.id;
    // Convert string to proper type: '1' = 'scholar', '2' or 'user' = 'user'
    const postType = postTypeParam === '1' ? 'scholar' : 'user';
    return await this.userPostShareService.unsharePost(
      userId,
      postId,
      postType,
    );
  }

  // Kullanıcının paylaşımlarını getir
  @Get('my-shares')
  async getMyShares(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Request() req?: any,
  ) {
    const userId = req.user.id;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;

    return await this.userPostShareService.getUserShares(
      userId,
      limitNumber,
      offsetNumber,
    );
  }

  // Gönderinin paylaşım sayısını getir
  @Get('post/:postId/count')
  async getPostShareCount(
    @Param('postId') postId: string,
    @Query('post_type') postTypeParam: string = 'user',
  ) {
    // Convert string to proper type: '1' = 'scholar', '2' or 'user' = 'user'
    const postType = postTypeParam === '1' ? 'scholar' : 'user';
    const count = await this.userPostShareService.getPostShareCount(
      postId,
      postType,
    );
    return { count };
  }

  // Kullanıcı bu gönderiyi paylaşmış mı kontrol et
  @Get('check/:postId')
  async isPostSharedByUser(
    @Param('postId') postId: string,
    @Query('post_type') postTypeParam: string = 'user',
    @Request() req: any,
  ) {
    const userId = req.user.id;
    // Convert string to proper type: '1' = 'scholar', '2' or 'user' = 'user'
    const postType = postTypeParam === '1' ? 'scholar' : 'user';
    const isShared = await this.userPostShareService.isPostSharedByUser(
      userId,
      postId,
      postType,
    );
    return { isShared };
  }
}
