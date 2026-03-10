import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';
import { Scholar } from '../scholars/entities/scholar.entity';
import { User } from '../users/entities/user.entity';
import { CacheService } from './cache.service';

@Injectable()
export class UserScholarFollowService {
  constructor(
    @InjectRepository(UserScholarFollow)
    private userScholarFollowRepository: Repository<UserScholarFollow>,
    @InjectRepository(Scholar)
    private scholarRepository: Repository<Scholar>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly cacheService: CacheService,
  ) {}

  private async invalidateWhoToFollowCache(userId: number): Promise<void> {
    try {
      const limits = [10, 15, 200];
      const types = ['scholars', 'users', 'all'];
      for (const type of types) {
        for (const limit of limits) {
          await this.cacheService.del(`who-to-follow:${type}:${userId}:${limit}`);
        }
      }
    } catch (error) {
      console.error('Who-to-follow cache invalidation error:', error?.message);
    }
  }

  async follow(user_id: number, scholar_id: number) {
    const existing = await this.userScholarFollowRepository.findOneBy({
      user_id,
      scholar_id,
    });
    if (existing) return existing;
    const follow = this.userScholarFollowRepository.create({
      user_id,
      scholar_id,
    });
    const saved = await this.userScholarFollowRepository.save(follow);
    await this.invalidateWhoToFollowCache(user_id);
    return saved;
  }

  async unfollow(user_id: number, scholar_id: number) {
    const follow = await this.userScholarFollowRepository.findOneBy({
      user_id,
      scholar_id,
    });
    if (!follow) throw new NotFoundException('Takip ilişkisi bulunamadı.');
    await this.userScholarFollowRepository.remove(follow);
    await this.invalidateWhoToFollowCache(user_id);
    return { unfollowed: true };
  }

  async findFollow(user_id: number, scholar_id: number) {
    return this.userScholarFollowRepository.findOneBy({ user_id, scholar_id });
  }

  // Takip edilen alimleri getir
  async getFollowingScholars(
    userId: number,
    limit: number = 20,
    offset: number = 0,
  ) {
    const following = await this.userScholarFollowRepository
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.scholar', 'scholar')
      .select([
        'follow.id',
        'scholar.id',
        'scholar.fullName',
        'scholar.photoUrl',
        'scholar.biography',
        'scholar.lineage',
        'scholar.birthDate',
        'scholar.deathDate',
        'scholar.locationName',
      ])
      .where('follow.user_id = :userId', { userId })
      .orderBy('follow.id', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return following.map((follow) => ({
      id: follow.scholar.id,
      fullName: follow.scholar.fullName,
      photoUrl: follow.scholar.photoUrl,
      biography: follow.scholar.biography,
      lineage: follow.scholar.lineage,
      birthDate: follow.scholar.birthDate,
      deathDate: follow.scholar.deathDate,
      locationName: follow.scholar.locationName,
      followId: follow.id,
      followedAt: follow.id, // ID'yi tarih olarak kullanıyoruz, gerçek tarih için migration gerekli
    }));
  }

  // Takip edilen alim sayısını getir
  async getFollowingScholarsCount(userId: number): Promise<number> {
    return this.userScholarFollowRepository.count({
      where: { user_id: userId },
    });
  }

  // Bir alim'i takip eden kullanıcıları getir
  async getScholarFollowers(
    scholarId: number,
    limit: number = 20,
    offset: number = 0,
  ) {
    const followers = await this.userScholarFollowRepository
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.user', 'user')
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
      .where('follow.scholar_id = :scholarId', { scholarId })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .orderBy('follow.id', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return followers.map((follow) => ({
      id: follow.user.id,
      firstName: follow.user.firstName,
      lastName: follow.user.lastName,
      username: follow.user.username,
      photoUrl: follow.user.photoUrl,
      role: follow.user.role,
      followId: follow.id,
      followedAt: follow.id,
    }));
  }

  // Bir alim'i takip eden kullanıcı sayısını getir
  async getScholarFollowersCount(scholarId: number): Promise<number> {
    return this.userScholarFollowRepository.count({
      where: { scholar_id: scholarId },
    });
  }
}
