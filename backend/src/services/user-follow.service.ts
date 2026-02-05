import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserFollow } from '../entities/user-follow.entity';
import { User } from '../users/entities/user.entity';
import { UserPost } from '../entities/user-post.entity';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';
import { ScholarPost } from '../scholars/entities/scholar-post.entity';
import { CacheService } from './cache.service';

@Injectable()
export class UserFollowService {
  constructor(
    @InjectRepository(UserFollow)
    private userFollowRepository: Repository<UserFollow>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserPost)
    private userPostRepository: Repository<UserPost>,
    @InjectRepository(ScholarPost)
    private scholarPostRepository: Repository<ScholarPost>,
    @InjectRepository(UserScholarFollow)
    private userScholarFollowRepository: Repository<UserScholarFollow>,
    private readonly cacheService: CacheService,
  ) {}

  // Cache'i temizle (follow/unfollow işlemlerinde)
  private async invalidateFollowingCache(userId: number): Promise<void> {
    try {
      await this.cacheService.delPattern(`following:*:${userId}:*`);
      await this.cacheService.delPattern(`following:*:${userId}`);
    } catch (error) {
      console.error('Following cache invalidation error:', error.message);
    }
  }

  async follow(follower_id: number, following_id: number) {
    if (follower_id === following_id)
      throw new NotFoundException('Kendini takip edemezsin.');
    const existing = await this.userFollowRepository.findOneBy({
      follower_id,
      following_id,
    });
    if (existing) return existing;
    const follow = this.userFollowRepository.create({
      follower_id,
      following_id,
    });
    const savedFollow = await this.userFollowRepository.save(follow);

    // Cache'i temizle
    await this.invalidateFollowingCache(follower_id);
    await this.invalidateFollowingCache(following_id);

    return savedFollow;
  }

  async unfollow(follower_id: number, following_id: number) {
    const follow = await this.userFollowRepository.findOneBy({
      follower_id,
      following_id,
    });
    if (!follow) throw new NotFoundException('Takip ilişkisi bulunamadı.');
    await this.userFollowRepository.remove(follow);

    // Cache'i temizle
    await this.invalidateFollowingCache(follower_id);
    await this.invalidateFollowingCache(following_id);

    return { unfollowed: true };
  }

  async findFollow(follower_id: number, following_id: number) {
    return this.userFollowRepository.findOneBy({ follower_id, following_id });
  }

  // Takip edilen kullanıcıları getir
  async getFollowingUsers(
    userId: number,
    limit: number = 20,
    offset: number = 0,
  ) {
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
      followedAt: follow.id, // ID'yi tarih olarak kullanıyoruz, gerçek tarih için migration gerekli
    }));
  }

  // Takipçileri getir
  async getFollowers(userId: number, limit: number = 20, offset: number = 0) {
    // Cache key oluştur
    const cacheKey = `following:followers:${userId}:${limit}:${offset}`;

    // Önce cache'den kontrol et
    const cachedResult = await this.cacheService.get<any[]>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Cache'de yoksa veritabanından getir
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
      .orderBy('follow.id', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    const result = followers.map((follow) => ({
      id: follow.follower.id,
      firstName: follow.follower.firstName,
      lastName: follow.follower.lastName,
      username: follow.follower.username,
      photoUrl: follow.follower.photoUrl,
      role: follow.follower.role,
      followId: follow.id,
      followedAt: follow.id, // ID'yi tarih olarak kullanıyoruz, gerçek tarih için migration gerekli
    }));

    // Sonucu cache'e kaydet (2 dakika)
    await this.cacheService.set(cacheKey, result, 120);

    return result;
  }

  // Takip edilen kullanıcı sayısını getir
  async getFollowingCount(userId: number): Promise<number> {
    return this.userFollowRepository.count({
      where: { follower_id: userId },
    });
  }

  // Takipçi sayısını getir
  async getFollowersCount(userId: number): Promise<number> {
    return this.userFollowRepository.count({
      where: { following_id: userId },
    });
  }

  // Takip edilen alim ve kullanıcıların son post'larını getir
  async getRecentPostsFromFollowing(
    userId: number,
    limit: number = 5,
    language: string = 'tr',
  ) {
    try {
      // 1. Takip edilen kullanıcıların ID'lerini al
      const followingUsers = await this.userFollowRepository
        .createQueryBuilder('follow')
        .select('follow.following_id')
        .where('follow.follower_id = :userId', { userId })
        .getMany();

      const followingUserIds = followingUsers.map((f) => f.following_id);

      // 2. Kullanıcı post'larını getir
      const userPosts = await this.getUserPosts(
        followingUserIds,
        Math.ceil(limit / 2),
      );

      // 3. Alim post'larını getir (dil parametresi ile)
      const scholarPosts = await this.getScholarPosts(
        userId,
        Math.ceil(limit / 2),
        language,
      );

      // 4. Tüm post'ları birleştir ve tarihe göre sırala
      const allPosts = [...userPosts, ...scholarPosts];
      allPosts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      // 5. Limit'e göre kes
      return allPosts.slice(0, limit);
    } catch (error) {
      console.error('❌ Error in getRecentPostsFromFollowing:', error.message);
      throw new Error(`Son post'lar getirilirken hata: ${error.message}`);
    }
  }

  // Kullanıcı post'larını getir
  private async getUserPosts(userIds: number[], limit: number) {
    if (userIds.length === 0) return [];

    // Basit query kullanarak user posts'ları al
    const posts = await this.userPostRepository.find({
      where: { user_id: In(userIds) },
      order: { created_at: 'DESC' },
      take: limit,
    });

    // Her post için user bilgilerini al
    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const user = await this.userRepository.findOne({
          where: { id: post.user_id, isActive: true },
          select: [
            'id',
            'firstName',
            'lastName',
            'username',
            'photoUrl',
            'role',
          ],
        });

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
          author: {
            id: user?.id,
            firstName: user?.firstName,
            lastName: user?.lastName,
            username: user?.username,
            photoUrl: user?.photoUrl,
            role: user?.role,
            type: 'user',
          },
          type: 'user_post',
        };
      }),
    );

    return postsWithUsers;
  }

  // Alim post'larını getir
  private async getScholarPosts(
    userId: number,
    limit: number,
    language: string = 'tr',
  ) {
    try {
      // Takip edilen alimlerin ID'lerini al
      const followingScholars = await this.userScholarFollowRepository
        .createQueryBuilder('follow')
        .select('follow.scholar_id')
        .where('follow.user_id = :userId', { userId })
        .getMany();

      const followingScholarIds = followingScholars.map((f) => f.scholar_id);

      if (followingScholarIds.length === 0) return [];

      // Alim post'larını getir - find() ile relations kullan
      const posts = await this.scholarPostRepository.find({
        where: { scholarId: In(followingScholarIds) },
        relations: ['scholar', 'translations'],
        order: { createdAt: 'DESC' },
        take: limit,
      });

      return posts.map((post) => {
        // Seçilen dildeki çeviriyi al, yoksa Türkçe, yoksa ilk mevcut
        const translation =
          post.translations?.find((t) => t.language === language) ||
          post.translations?.find((t) => t.language === 'tr') ||
          post.translations?.[0];

        return {
          id: post.id,
          content: translation?.content || '',
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          author: {
            id: post.scholar?.id,
            fullName: post.scholar?.fullName,
            photoUrl: post.scholar?.photoUrl,
            biography: post.scholar?.biography,
            type: 'scholar',
          },
          type: 'scholar_post',
        };
      });
    } catch (error) {
      console.error("Alim post'ları getirilirken hata:", error);
      return [];
    }
  }
}
