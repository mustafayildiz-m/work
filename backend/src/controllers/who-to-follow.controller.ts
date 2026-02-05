import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { WhoToFollowService } from '../services/who-to-follow.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('who-to-follow')
export class WhoToFollowController {
  constructor(private readonly whoToFollowService: WhoToFollowService) {}

  @Get()
  async getWhoToFollow(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: 'users' | 'scholars' | 'all',
    @Request() req?: any,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const userId = req?.user?.id;
    const searchType = type || 'all';

    // Eğer pagination yoksa (page belirtilmemişse), basit listeyi döndür
    if (!page) {
      const results = await this.whoToFollowService.getWhoToFollow(
        limitNumber,
        searchType,
        userId,
      );
      return results;
    }

    // Pagination varsa, kullanıcıları getir
    const [users, totalCount] = await Promise.all([
      this.whoToFollowService.getWhoToFollowUsers(
        userId,
        pageNumber,
        limitNumber,
      ),
      this.whoToFollowService.getUsersCount(userId),
    ]);

    return {
      users,
      totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      hasMore: pageNumber * limitNumber < totalCount,
    };
  }

  @Get('search')
  async searchWhoToFollow(
    @Query('q') searchQuery: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    if (!searchQuery || searchQuery.trim() === '') {
      return {
        users: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        hasMore: false,
      };
    }

    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const userId = req?.user?.id;

    const [users, totalCount] = await Promise.all([
      this.whoToFollowService.searchUsers(
        searchQuery.trim(),
        userId,
        pageNumber,
        limitNumber,
      ),
      this.whoToFollowService.searchUsersCount(searchQuery.trim(), userId),
    ]);

    return {
      users,
      totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      hasMore: pageNumber * limitNumber < totalCount,
      searchQuery: searchQuery.trim(),
    };
  }
}
