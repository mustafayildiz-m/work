import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SearchService } from '../services/search.service';

@UseGuards(AuthGuard('jwt'))
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // Genel arama - tüm kullanıcılar arasında
  @Get('users')
  async searchUsers(
    @Query('q') searchQuery: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Request() req?: any,
  ) {
    if (!searchQuery || searchQuery.trim() === '') {
      return { users: [], totalCount: 0, hasMore: false };
    }

    const userId = req?.user?.id;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;

    const [users, totalCount] = await Promise.all([
      this.searchService.searchUsers(
        searchQuery.trim(),
        limitNumber,
        offsetNumber,
        userId,
      ),
      this.searchService.getSearchUsersCount(searchQuery.trim(), userId),
    ]);

    return {
      users,
      totalCount,
      hasMore: offsetNumber + limitNumber < totalCount,
      searchQuery: searchQuery.trim(),
    };
  }

  // Takipçiler arasında arama
  @Get('followers')
  async searchFollowers(
    @Query('q') searchQuery: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Request() req?: any,
  ) {
    if (!searchQuery || searchQuery.trim() === '') {
      return { users: [], totalCount: 0, hasMore: false };
    }

    const userId = req?.user?.id;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;

    const [users, totalCount] = await Promise.all([
      this.searchService.searchFollowers(
        searchQuery.trim(),
        limitNumber,
        offsetNumber,
        userId,
      ),
      this.searchService.getSearchFollowersCount(searchQuery.trim(), userId),
    ]);

    return {
      users,
      totalCount,
      hasMore: offsetNumber + limitNumber < totalCount,
      searchQuery: searchQuery.trim(),
    };
  }

  // Takip edilen kullanıcılar arasında arama
  @Get('following')
  async searchFollowing(
    @Query('q') searchQuery: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Request() req?: any,
  ) {
    if (!searchQuery || searchQuery.trim() === '') {
      return { users: [], totalCount: 0, hasMore: false };
    }

    const userId = req?.user?.id;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;

    const [users, totalCount] = await Promise.all([
      this.searchService.searchFollowing(
        searchQuery.trim(),
        limitNumber,
        offsetNumber,
        userId,
      ),
      this.searchService.getSearchFollowingCount(searchQuery.trim(), userId),
    ]);

    return {
      users,
      totalCount,
      hasMore: offsetNumber + limitNumber < totalCount,
      searchQuery: searchQuery.trim(),
    };
  }

  // Alimler arasında arama
  @Get('scholars')
  async searchScholars(
    @Query('q') searchQuery: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    if (!searchQuery || searchQuery.trim() === '') {
      return {
        scholars: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        hasMore: false,
      };
    }

    const userId = req?.user?.id;
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const offsetNumber = (pageNumber - 1) * limitNumber;

    const [scholars, totalCount] = await Promise.all([
      this.searchService.searchScholars(
        searchQuery.trim(),
        limitNumber,
        offsetNumber,
        userId,
      ),
      this.searchService.getSearchScholarsCount(searchQuery.trim(), userId),
    ]);

    return {
      scholars,
      totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      hasMore: pageNumber * limitNumber < totalCount,
      searchQuery: searchQuery.trim(),
    };
  }

  // Genel arama - tüm türlerde
  @Get()
  async generalSearch(
    @Query('q') searchQuery: string,
    @Query('type') type?: 'users' | 'scholars' | 'all',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Request() req?: any,
  ) {
    if (!searchQuery || searchQuery.trim() === '') {
      return { results: [], totalCount: 0, hasMore: false };
    }

    const userId = req?.user?.id;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;
    const searchType = type || 'all';

    return this.searchService.generalSearch(
      searchQuery.trim(),
      searchType,
      limitNumber,
      offsetNumber,
      userId,
    );
  }
}
