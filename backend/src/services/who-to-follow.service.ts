import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Scholar } from '../scholars/entities/scholar.entity';
import { UserFollowService } from './user-follow.service';
import { UserScholarFollowService } from './user-scholar-follow.service';
import { CacheService } from './cache.service';

export interface WhoToFollowItem {
  id: number;
  name: string;
  description: string;
  photoUrl?: string;
  type: 'user' | 'scholar';
  username?: string;
  fullName?: string;
  isFollowing?: boolean;
  role?: string;
}

@Injectable()
export class WhoToFollowService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Scholar)
    private readonly scholarRepository: Repository<Scholar>,
    private readonly userFollowService: UserFollowService,
    private readonly userScholarFollowService: UserScholarFollowService,
    private readonly cacheService: CacheService,
  ) { }

  async getWhoToFollow(
    limit: number = 10,
    type: 'users' | 'scholars' | 'all' = 'all',
    userId?: number,
  ): Promise<WhoToFollowItem[]> {
    // Cache key oluştur - kullanıcı bazlı cache
    const cacheKey = `who-to-follow:${type}:${userId || 'guest'}:${limit}`;

    // Cache'den kontrol et
    const cachedResult =
      await this.cacheService.get<WhoToFollowItem[]>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const result: WhoToFollowItem[] = [];

    if (type === 'all' || type === 'users') {
      // Type 'users' ise full limit, 'all' ise yarısı
      const userLimit = type === 'users' ? limit : Math.ceil(limit / 2);

      const userQuery = await this.userRepository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.firstName',
          'user.lastName',
          'user.username',
          'user.photoUrl',
          'user.role',
        ])
        .where('user.isActive = :isActive', { isActive: true });

      // Mevcut kullanıcıyı hariç tut
      if (userId) {
        userQuery.andWhere('user.id != :userId', { userId });
      }

      const users = await userQuery
        .orderBy('RAND()')
        .limit(userLimit)
        .getMany();

      const userItems: WhoToFollowItem[] = await Promise.all(
        users.map(async (user) => {
          let isFollowing = false;
          if (userId) {
            try {
              const followRecord = await this.userFollowService.findFollow(
                userId,
                user.id,
              );
              isFollowing = !!followRecord;
            } catch (error) {
              isFollowing = false;
            }
          }

          return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            description: user.biography,
            photoUrl: user.photoUrl,
            type: 'user',
            username: user.username,
            role: user.role,
            isFollowing,
          };
        }),
      );

      result.push(...userItems);
    }

    if (type === 'all' || type === 'scholars') {
      // Type 'scholars' ise full limit, 'all' ise yarısı
      const scholarLimit = type === 'scholars' ? limit : Math.ceil(limit / 2);

      const scholars = await this.scholarRepository
        .createQueryBuilder('scholar')
        .select([
          'scholar.id',
          'scholar.fullName',
          'scholar.photoUrl',
          'scholar.biography',
        ])
        .orderBy('RAND()')
        .limit(scholarLimit)
        .getMany();

      const scholarItems: WhoToFollowItem[] = await Promise.all(
        scholars.map(async (scholar) => {
          let isFollowing = false;
          if (userId) {
            try {
              const followRecord =
                await this.userScholarFollowService.findFollow(
                  userId,
                  scholar.id,
                );
              isFollowing = !!followRecord;
            } catch (error) {
              isFollowing = false;
            }
          }

          return {
            id: scholar.id,
            name: scholar.fullName,
            description: this.getScholarDescription(scholar.biography),
            photoUrl: scholar.photoUrl,
            type: 'scholar',
            fullName: scholar.fullName,
            isFollowing,
          };
        }),
      );

      result.push(...scholarItems);
    }

    // Eğer yeterli sonuç yoksa, eksik olan kısmı diğer türden tamamla
    if (result.length < limit) {
      const remainingLimit = limit - result.length;

      if (type === 'all') {
        // Hangi türden daha az sonuç varsa, o türden daha fazla getir
        const userCount = result.filter((item) => item.type === 'user').length;
        const scholarCount = result.filter(
          (item) => item.type === 'scholar',
        ).length;

        if (userCount < scholarCount) {
          // Daha fazla kullanıcı getir
          const additionalUsers = await this.getAdditionalUsers(
            remainingLimit,
            userId,
            result.map((item) => item.id),
          );
          result.push(...additionalUsers);
        } else {
          // Daha fazla alim getir
          const additionalScholars = await this.getAdditionalScholars(
            remainingLimit,
            userId,
            result.map((item) => item.id),
          );
          result.push(...additionalScholars);
        }
      } else if (type === 'users') {
        const additionalUsers = await this.getAdditionalUsers(
          remainingLimit,
          userId,
          result.map((item) => item.id),
        );
        result.push(...additionalUsers);
      } else if (type === 'scholars') {
        const additionalScholars = await this.getAdditionalScholars(
          remainingLimit,
          userId,
          result.map((item) => item.id),
        );
        result.push(...additionalScholars);
      }
    }

    // Karıştır ve limit'e göre kes
    const finalResult = this.shuffleArray(result).slice(0, limit);

    // Cache'e kaydet - 5 dakika (300 saniye)
    await this.cacheService.set(cacheKey, finalResult, 300);

    return finalResult;
  }

  private getUserDescription(role: string): string {
    switch (role) {
      case 'admin':
        return 'Sistem Yöneticisi';
      case 'moderator':
        return 'Moderatör';
      default:
        return 'Kullanıcı';
    }
  }

  private getScholarDescription(biography: string): string {
    // Biyografiden kısa bir açıklama çıkar
    if (biography.length > 50) {
      return biography.substring(0, 50) + '...';
    }
    return biography;
  }

  private async getAdditionalUsers(
    limit: number,
    userId?: number,
    excludeIds: number[] = [],
  ): Promise<WhoToFollowItem[]> {
    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.username',
        'user.photoUrl',
        'user.role',
      ])
      .where('user.isActive = :isActive', { isActive: true });

    if (userId) {
      userQuery.andWhere('user.id != :userId', { userId });
    }

    if (excludeIds.length > 0) {
      userQuery.andWhere('user.id NOT IN (:...excludeIds)', { excludeIds });
    }

    const users = await userQuery.orderBy('RAND()').limit(limit).getMany();

    return Promise.all(
      users.map(async (user) => {
        let isFollowing = false;
        if (userId) {
          try {
            const followRecord = await this.userFollowService.findFollow(
              userId,
              user.id,
            );
            isFollowing = !!followRecord;
          } catch (error) {
            isFollowing = false;
          }
        }

        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          description: user.biography,
          photoUrl: user.photoUrl,
          type: 'user',
          username: user.username,
          role: user.role,
          isFollowing,
        };
      }),
    );
  }

  private async getAdditionalScholars(
    limit: number,
    userId?: number,
    excludeIds: number[] = [],
  ): Promise<WhoToFollowItem[]> {
    const scholarQuery = this.scholarRepository
      .createQueryBuilder('scholar')
      .select([
        'scholar.id',
        'scholar.fullName',
        'scholar.photoUrl',
        'scholar.biography',
      ]);

    if (excludeIds.length > 0) {
      scholarQuery.where('scholar.id NOT IN (:...excludeIds)', { excludeIds });
    }

    const scholars = await scholarQuery
      .orderBy('RAND()')
      .limit(limit)
      .getMany();

    return Promise.all(
      scholars.map(async (scholar) => {
        let isFollowing = false;
        if (userId) {
          try {
            const followRecord = await this.userScholarFollowService.findFollow(
              userId,
              scholar.id,
            );
            isFollowing = !!followRecord;
          } catch (error) {
            isFollowing = false;
          }
        }

        return {
          id: scholar.id,
          name: scholar.fullName,
          description: this.getScholarDescription(scholar.biography),
          photoUrl: scholar.photoUrl,
          type: 'scholar',
          fullName: scholar.fullName,
          isFollowing,
        };
      }),
    );
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get users with pagination
  async getWhoToFollowUsers(
    userId?: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<WhoToFollowItem[]> {
    const skip = (page - 1) * limit;

    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.username',
        'user.photoUrl',
        'user.role',
        'user.biography',
      ])
      .where('user.isActive = :isActive', { isActive: true });

    // Exclude current user
    if (userId) {
      userQuery.andWhere('user.id != :userId', { userId });
    }

    const users = await userQuery
      .orderBy('user.id', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    const userItems: WhoToFollowItem[] = await Promise.all(
      users.map(async (user) => {
        let isFollowing = false;
        if (userId) {
          try {
            const followRecord = await this.userFollowService.findFollow(
              userId,
              user.id,
            );
            isFollowing = !!followRecord;
          } catch (error) {
            isFollowing = false;
          }
        }

        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          description: user.biography,
          photoUrl: user.photoUrl,
          type: 'user',
          username: user.username,
          role: user.role,
          isFollowing,
        };
      }),
    );

    return userItems;
  }

  // Get total users count (excluding current user)
  async getUsersCount(userId?: number): Promise<number> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true });

    if (userId) {
      query.andWhere('user.id != :userId', { userId });
    }

    return query.getCount();
  }

  // Search users with pagination
  async searchUsers(
    searchQuery: string,
    userId?: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<WhoToFollowItem[]> {
    const skip = (page - 1) * limit;

    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.username',
        'user.photoUrl',
        'user.role',
        'user.biography',
      ])
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere(
        '(user.firstName LIKE :searchQuery OR user.lastName LIKE :searchQuery OR user.username LIKE :searchQuery OR user.biography LIKE :searchQuery)',
        { searchQuery: `%${searchQuery}%` },
      );

    // Exclude current user
    if (userId) {
      userQuery.andWhere('user.id != :userId', { userId });
    }

    const users = await userQuery
      .orderBy('user.firstName', 'ASC')
      .skip(skip)
      .take(limit)
      .getMany();

    const userItems: WhoToFollowItem[] = await Promise.all(
      users.map(async (user) => {
        let isFollowing = false;
        if (userId) {
          try {
            const followRecord = await this.userFollowService.findFollow(
              userId,
              user.id,
            );
            isFollowing = !!followRecord;
          } catch (error) {
            isFollowing = false;
          }
        }

        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          description: user.biography,
          photoUrl: user.photoUrl,
          type: 'user',
          username: user.username,
          role: user.role,
          isFollowing,
        };
      }),
    );

    return userItems;
  }

  // Get search users count
  async searchUsersCount(
    searchQuery: string,
    userId?: number,
  ): Promise<number> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere(
        '(user.firstName LIKE :searchQuery OR user.lastName LIKE :searchQuery OR user.username LIKE :searchQuery OR user.biography LIKE :searchQuery)',
        { searchQuery: `%${searchQuery}%` },
      );

    if (userId) {
      query.andWhere('user.id != :userId', { userId });
    }

    return query.getCount();
  }
}
