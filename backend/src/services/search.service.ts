import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Scholar } from '../scholars/entities/scholar.entity';
import { UserFollow } from '../entities/user-follow.entity';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Scholar)
    private scholarRepository: Repository<Scholar>,
    @InjectRepository(UserFollow)
    private userFollowRepository: Repository<UserFollow>,
    @InjectRepository(UserScholarFollow)
    private userScholarFollowRepository: Repository<UserScholarFollow>,
  ) {}

  // Tüm kullanıcılar arasında arama
  async searchUsers(
    searchQuery: string,
    limit: number = 20,
    offset: number = 0,
    currentUserId?: number,
  ) {
    const searchTerm = searchQuery.trim().toUpperCase();
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.username',
        'user.photoUrl',
        'user.role',
        'user.isActive',
      ])
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere(
        '(UPPER(user.firstName) LIKE :searchQuery OR UPPER(user.lastName) LIKE :searchQuery)',
        { searchQuery: `%${searchTerm}%` },
      )
      .orderBy('user.firstName', 'ASC')
      .limit(limit)
      .offset(offset);

    // Kendini arama sonuçlarından çıkar
    if (currentUserId) {
      queryBuilder.andWhere('user.id != :currentUserId', { currentUserId });
    }

    const users = await queryBuilder.getMany();

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
      role: user.role,
      fullName: `${user.firstName} ${user.lastName}`,
    }));
  }

  // Arama yapılan kullanıcı sayısını getir
  async getSearchUsersCount(
    searchQuery: string,
    currentUserId?: number,
  ): Promise<number> {
    const searchTerm = searchQuery.trim().toUpperCase();
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere(
        '(UPPER(user.firstName) LIKE :searchQuery OR UPPER(user.lastName) LIKE :searchQuery)',
        { searchQuery: `%${searchTerm}%` },
      );

    if (currentUserId) {
      queryBuilder.andWhere('user.id != :currentUserId', { currentUserId });
    }

    return queryBuilder.getCount();
  }

  // Takipçiler arasında arama
  async searchFollowers(
    searchQuery: string,
    limit: number = 20,
    offset: number = 0,
    userId: number,
  ) {
    const searchTerm = searchQuery.trim().toUpperCase();
    const followers = await this.userFollowRepository
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.follower', 'user')
      .select([
        'follow.id',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.username',
        'user.photoUrl',
        'user.role',
        'user.isActive',
      ])
      .where('follow.following_id = :userId', { userId })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .andWhere(
        '(UPPER(user.firstName) LIKE :searchQuery OR UPPER(user.lastName) LIKE :searchQuery)',
        { searchQuery: `%${searchTerm}%` },
      )
      .orderBy('follow.id', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return followers.map((follow) => ({
      id: follow.follower.id,
      firstName: follow.follower.firstName,
      lastName: follow.follower.lastName,
      username: follow.follower.username,
      photoUrl: follow.follower.photoUrl,
      role: follow.follower.role,
      followId: follow.id,
      followedAt: follow.id,
      fullName: `${follow.follower.firstName} ${follow.follower.lastName}`,
    }));
  }

  // Arama yapılan takipçi sayısını getir
  async getSearchFollowersCount(
    searchQuery: string,
    userId: number,
  ): Promise<number> {
    const searchTerm = searchQuery.trim().toUpperCase();
    return this.userFollowRepository
      .createQueryBuilder('follow')
      .leftJoin('follow.follower', 'user')
      .where('follow.following_id = :userId', { userId })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .andWhere(
        '(UPPER(user.firstName) LIKE :searchQuery OR UPPER(user.lastName) LIKE :searchQuery)',
        { searchQuery: `%${searchTerm}%` },
      )
      .getCount();
  }

  // Takip edilen kullanıcılar arasında arama
  async searchFollowing(
    searchQuery: string,
    limit: number = 20,
    offset: number = 0,
    userId: number,
  ) {
    const searchTerm = searchQuery.trim().toUpperCase();
    const following = await this.userFollowRepository
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.following', 'user')
      .select([
        'follow.id',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.username',
        'user.photoUrl',
        'user.role',
        'user.isActive',
      ])
      .where('follow.follower_id = :userId', { userId })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .andWhere(
        '(UPPER(user.firstName) LIKE :searchQuery OR UPPER(user.lastName) LIKE :searchQuery)',
        { searchQuery: `%${searchTerm}%` },
      )
      .orderBy('follow.id', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return following.map((follow) => ({
      id: follow.following.id,
      firstName: follow.following.firstName,
      lastName: follow.following.lastName,
      username: follow.following.username,
      photoUrl: follow.following.photoUrl,
      role: follow.following.role,
      followId: follow.id,
      followedAt: follow.id,
      fullName: `${follow.following.firstName} ${follow.following.lastName}`,
    }));
  }

  // Arama yapılan takip edilen kullanıcı sayısını getir
  async getSearchFollowingCount(
    searchQuery: string,
    userId: number,
  ): Promise<number> {
    const searchTerm = searchQuery.trim().toUpperCase();
    return this.userFollowRepository
      .createQueryBuilder('follow')
      .leftJoin('follow.following', 'user')
      .where('follow.follower_id = :userId', { userId })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .andWhere(
        '(UPPER(user.firstName) LIKE :searchQuery OR UPPER(user.lastName) LIKE :searchQuery)',
        { searchQuery: `%${searchTerm}%` },
      )
      .getCount();
  }

  // Alimler arasında arama
  async searchScholars(
    searchQuery: string,
    limit: number = 20,
    offset: number = 0,
    userId?: number,
  ) {
    const searchTerm = searchQuery.trim().toUpperCase();
    console.log('🔍 Scholar Search - Original Query:', searchQuery);
    console.log('🔍 Scholar Search - Search Term (uppercase):', searchTerm);
    console.log('🔍 Scholar Search - Pattern:', `%${searchTerm}%`);

    const queryBuilder = this.scholarRepository
      .createQueryBuilder('scholar')
      .select([
        'scholar.id',
        'scholar.fullName',
        'scholar.photoUrl',
        'scholar.birthDate',
        'scholar.deathDate',
        'scholar.locationName',
        'scholar.biography',
      ])
      .where('UPPER(scholar.fullName) LIKE :searchQuery', {
        searchQuery: `%${searchTerm}%`,
      })
      .orderBy('scholar.fullName', 'ASC')
      .limit(limit)
      .offset(offset);

    const scholars = await queryBuilder.getMany();
    console.log('🔍 Scholar Search - Found scholars:', scholars.length);
    if (scholars.length > 0) {
      console.log('🔍 First scholar:', scholars[0].fullName);
    }

    // Eğer kullanıcı ID'si verilmişse, takip durumunu da kontrol et
    if (userId) {
      const scholarIds = scholars.map((s) => s.id);
      if (scholarIds.length === 0) {
        return scholars.map((scholar) => ({
          ...scholar,
          isFollowed: false,
        }));
      }
      const followedScholars = await this.userScholarFollowRepository
        .createQueryBuilder('follow')
        .select(['follow.scholar_id'])
        .where('follow.user_id = :userId', { userId })
        .andWhere('follow.scholar_id IN (:...scholarIds)', { scholarIds })
        .getMany();

      const followedScholarIds = followedScholars.map((f) => f.scholar_id);

      return scholars.map((scholar) => ({
        ...scholar,
        isFollowed: followedScholarIds.includes(scholar.id),
      }));
    }

    return scholars;
  }

  // Arama yapılan alim sayısını getir
  async getSearchScholarsCount(
    searchQuery: string,
    userId?: number,
  ): Promise<number> {
    const searchTerm = searchQuery.trim().toUpperCase();
    return this.scholarRepository
      .createQueryBuilder('scholar')
      .where('UPPER(scholar.fullName) LIKE :searchQuery', {
        searchQuery: `%${searchTerm}%`,
      })
      .getCount();
  }

  // Genel arama - tüm türlerde
  async generalSearch(
    searchQuery: string,
    type: 'users' | 'scholars' | 'all',
    limit: number = 20,
    offset: number = 0,
    userId?: number,
  ) {
    const results: any[] = [];
    let totalCount = 0;

    if (type === 'all' || type === 'users') {
      const [users, userCount] = await Promise.all([
        this.searchUsers(searchQuery, Math.ceil(limit / 2), offset, userId),
        this.getSearchUsersCount(searchQuery, userId),
      ]);

      const userResults = users.map((user) => ({
        ...user,
        type: 'user',
      }));

      results.push(...userResults);
      totalCount += userCount;
    }

    if (type === 'all' || type === 'scholars') {
      const [scholars, scholarCount] = await Promise.all([
        this.searchScholars(searchQuery, Math.ceil(limit / 2), offset, userId),
        this.getSearchScholarsCount(searchQuery, userId),
      ]);

      const scholarResults = scholars.map((scholar) => ({
        ...scholar,
        type: 'scholar',
      }));

      results.push(...scholarResults);
      totalCount += scholarCount;
    }

    // Sonuçları karıştır ve limit'e göre kes
    const shuffledResults = results.sort(() => Math.random() - 0.5);
    const finalResults = shuffledResults.slice(0, limit);

    return {
      results: finalResults,
      totalCount,
      hasMore: offset + limit < totalCount,
      searchQuery,
    };
  }
}
