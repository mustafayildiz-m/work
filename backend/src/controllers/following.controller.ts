import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { UserFollowService } from '../services/user-follow.service';
import { UserScholarFollowService } from '../services/user-scholar-follow.service';
import { AuthGuard } from '@nestjs/passport';

export interface FollowingItem {
  id: number;
  name: string;
  photoUrl?: string;
  type: 'user' | 'scholar';
  username?: string;
  fullName?: string;
  biography?: string;
  role?: string;
  followId: number;
  followedAt: number;
}

@UseGuards(AuthGuard('jwt'))
@Controller('following')
export class FollowingController {
  constructor(
    private readonly userFollowService: UserFollowService,
    private readonly userScholarFollowService: UserScholarFollowService,
  ) {}

  // Tüm takip edilenleri getir (kullanıcılar + alimler)
  @Get()
  async getAllFollowing(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('type') type?: 'users' | 'scholars' | 'all',
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;
    const followType = type || 'all';

    const result: FollowingItem[] = [];

    if (followType === 'all' || followType === 'users') {
      const [users, userCount] = await Promise.all([
        this.userFollowService.getFollowingUsers(
          userId,
          Math.ceil(limitNumber / 2),
          offsetNumber,
        ),
        this.userFollowService.getFollowingCount(userId),
      ]);

      const userItems: FollowingItem[] = users.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        photoUrl: user.photoUrl,
        type: 'user' as const,
        username: user.username,
        role: user.role,
        followId: user.followId,
        followedAt: user.followedAt,
      }));

      result.push(...userItems);
    }

    if (followType === 'all' || followType === 'scholars') {
      const [scholars, scholarCount] = await Promise.all([
        this.userScholarFollowService.getFollowingScholars(
          userId,
          Math.ceil(limitNumber / 2),
          offsetNumber,
        ),
        this.userScholarFollowService.getFollowingScholarsCount(userId),
      ]);

      const scholarItems: FollowingItem[] = scholars.map((scholar) => ({
        id: scholar.id,
        name: scholar.fullName,
        photoUrl: scholar.photoUrl,
        type: 'scholar' as const,
        fullName: scholar.fullName,
        biography: scholar.biography,
        followId: scholar.followId,
        followedAt: scholar.followedAt,
      }));

      result.push(...scholarItems);
    }

    // Tarihe göre sırala (en yeni takip edilenler önce)
    result.sort((a, b) => b.followedAt - a.followedAt);

    // Limit'e göre kes
    const finalResult = result.slice(0, limitNumber);

    // Toplam sayıları hesapla
    const [totalUserCount, totalScholarCount] = await Promise.all([
      this.userFollowService.getFollowingCount(userId),
      this.userScholarFollowService.getFollowingScholarsCount(userId),
    ]);

    const totalCount =
      followType === 'users'
        ? totalUserCount
        : followType === 'scholars'
          ? totalScholarCount
          : totalUserCount + totalScholarCount;

    return {
      items: finalResult,
      totalCount,
      hasMore: offsetNumber + limitNumber < totalCount,
      stats: {
        usersCount: totalUserCount,
        scholarsCount: totalScholarCount,
        totalCount,
      },
    };
  }

  // Sadece takip edilen kullanıcıları getir
  @Get('users')
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

  // Sadece takip edilen alimleri getir
  @Get('scholars')
  async getFollowingScholars(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;

    const [scholars, totalCount] = await Promise.all([
      this.userScholarFollowService.getFollowingScholars(
        userId,
        limitNumber,
        offsetNumber,
      ),
      this.userScholarFollowService.getFollowingScholarsCount(userId),
    ]);

    return {
      scholars,
      totalCount,
      hasMore: offsetNumber + limitNumber < totalCount,
    };
  }

  // Takip istatistiklerini getir
  @Get('stats')
  async getFollowingStats(@Request() req?: any) {
    const userId = req?.user?.id;

    const [userFollowingCount, userFollowersCount, scholarFollowingCount] =
      await Promise.all([
        this.userFollowService.getFollowingCount(userId),
        this.userFollowService.getFollowersCount(userId),
        this.userScholarFollowService.getFollowingScholarsCount(userId),
      ]);

    return {
      followingUsersCount: userFollowingCount,
      followersCount: userFollowersCount,
      followingScholarsCount: scholarFollowingCount,
      totalFollowingCount: userFollowingCount + scholarFollowingCount,
    };
  }

  // Takip edilen alim ve kullanıcıların son post'larını getir
  @Get('recent-posts')
  async getRecentPostsFromFollowing(
    @Query('limit') limit?: string,
    @Query('language') language?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    const limitNumber = limit ? parseInt(limit, 10) : 5;
    const lang = language || 'tr';

    try {
      const recentPosts =
        await this.userFollowService.getRecentPostsFromFollowing(
          userId,
          limitNumber,
          lang,
        );

      return {
        posts: recentPosts,
        totalCount: recentPosts.length,
        message: `Takip edilen ${recentPosts.length} son post getirildi`,
      };
    } catch (error) {
      throw new Error(`Son post'lar getirilirken hata: ${error.message}`);
    }
  }
}
