import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserFollowService } from '../services/user-follow.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('user-follow')
export class UserFollowController {
  constructor(private readonly userFollowService: UserFollowService) {}

  @Post('follow')
  follow(@Body() body: { follower_id: number; following_id: number }) {
    return this.userFollowService.follow(body.follower_id, body.following_id);
  }

  @Delete('unfollow')
  unfollow(@Body() body: { follower_id: number; following_id: number }) {
    return this.userFollowService.unfollow(body.follower_id, body.following_id);
  }

  // Takip edilen kullanıcıları getir
  @Get('following')
  async getFollowingUsers(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;

    const [users, totalCount] = await Promise.all([
      this.userFollowService.getFollowingUsers(
        userId,
        limitNumber,
        offsetNumber,
      ),
      this.userFollowService.getFollowingCount(userId),
    ]);

    return {
      users,
      totalCount,
      hasMore: offsetNumber + limitNumber < totalCount,
    };
  }

  // Takipçileri getir
  @Get('followers')
  async getFollowers(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;

    const [users, totalCount] = await Promise.all([
      this.userFollowService.getFollowers(userId, limitNumber, offsetNumber),
      this.userFollowService.getFollowersCount(userId),
    ]);

    return {
      users,
      totalCount,
      hasMore: offsetNumber + limitNumber < totalCount,
    };
  }

  // Takip istatistiklerini getir
  @Get('stats')
  async getFollowStats(@Request() req?: any) {
    const userId = req?.user?.id;

    const [followingCount, followersCount] = await Promise.all([
      this.userFollowService.getFollowingCount(userId),
      this.userFollowService.getFollowersCount(userId),
    ]);

    return {
      followingCount,
      followersCount,
    };
  }
}
