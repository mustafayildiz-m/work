import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserFollow } from '../entities/user-follow.entity';
import { User } from '../users/entities/user.entity';
import { UserPost } from '../entities/user-post.entity';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';
import { ScholarPost } from '../scholars/entities/scholar-post.entity';
import { CacheService } from './cache.service';
import { ChatGateway } from '../chat/chat.gateway';
import { NotificationService } from './notification.service';

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
    private readonly chatGateway: ChatGateway,
    private readonly notificationService: NotificationService,
  ) { }

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

    const targetUser = await this.userRepository.findOneBy({ id: following_id });
    if (!targetUser) throw new NotFoundException('Kullanıcı bulunamadı.');

    const existing = await this.userFollowRepository.findOneBy({
      follower_id,
      following_id,
    });
    if (existing) return existing;

    // Eğer takip edilen kişi "scholar" (alim) ise doğrudan takip edilir.
    // Değilse (normal user) onay mekanizması ('pending') devreye girer.
    const status = targetUser.role === 'scholar' ? 'accepted' : 'pending';

    const follow = this.userFollowRepository.create({
      follower_id,
      following_id,
      status,
    });
    const savedFollow = await this.userFollowRepository.save(follow);

    if (status === 'accepted') {
      // Doğrudan takip edildiyse cache'leri temizleyebiliriz
      await this.invalidateFollowingCache(follower_id);
      await this.invalidateFollowingCache(following_id);
    } else {
      // Sadece frontend state'inin güncellenmesi için istek atanın cache'ini siliyoruz
      await this.invalidateFollowingCache(follower_id);

      // Webhook/Websocket üzerinden bildirim gönder
      try {
        const follower = await this.userRepository.findOne({
          where: { id: follower_id },
          select: ['id', 'username', 'firstName', 'lastName', 'photoUrl'],
        });

        if (this.chatGateway) {
          this.chatGateway.sendToUser(following_id, 'newFollowRequest', {
            id: savedFollow.id,
            followerId: follower_id,
            follower: follower,
            createdAt: new Date(),
          });
        }

      } catch (wsError) {
        console.error('WS Notification error:', wsError.message);
      }
    }

    return savedFollow;
  }

  async acceptFollowRequest(follower_id: number, following_id: number) {
    const follow = await this.userFollowRepository.findOneBy({
      follower_id,
      following_id,
      status: 'pending', // Sadece pending olanları kabul edebiliriz
    });

    if (!follow) throw new NotFoundException('Takip isteği bulunamadı.');

    // İsteği accepted yapıyoruz
    follow.status = 'accepted';
    await this.userFollowRepository.save(follow);

    // Mutually connect - Karşı tarafı da otomatik takip etmesi için (LinkedIn mantığı)
    const existingReverse = await this.userFollowRepository.findOneBy({
      follower_id: following_id,
      following_id: follower_id,
    });

    if (!existingReverse) {
      const reverseFollow = this.userFollowRepository.create({
        follower_id: following_id,
        following_id: follower_id,
        status: 'accepted',
      });
      await this.userFollowRepository.save(reverseFollow);
    } else if (existingReverse.status === 'pending') {
      existingReverse.status = 'accepted';
      await this.userFollowRepository.save(existingReverse);
    }

    // Cache'leri temizle (Artık listelerde görünecekler)
    await this.invalidateFollowingCache(follower_id);
    await this.invalidateFollowingCache(following_id);

    // Webhook/Websocket üzerinden bildirim gönder (İsteği gönderene haber ver)
    try {
      const accepter = await this.userRepository.findOne({
        where: { id: following_id },
        select: ['id', 'username', 'firstName', 'lastName', 'photoUrl'],
      });

      if (this.chatGateway) {
        this.chatGateway.sendToUser(follower_id, 'followRequestAccepted', {
          accepterId: following_id,
          accepter: accepter,
          createdAt: new Date(),
        });
      }

      // Veritabanına bildirimi kaydet
      await this.notificationService.createNotification({
        userId: follower_id,
        type: 'follow_accept',
        title: 'Takip İsteği Kabul Edildi',
        message: accepter
          ? `${accepter.firstName} ${accepter.lastName} takip isteğinizi kabul etti.`
          : 'Takip isteğiniz kabul edildi.',
        relatedUserId: following_id,
      });
    } catch (wsError) {
      console.error('WS Notification error (accept):', wsError.message);
    }

    return { accepted: true };
  }

  async rejectFollowRequest(follower_id: number, following_id: number) {
    const follow = await this.userFollowRepository.findOneBy({
      follower_id,
      following_id,
      status: 'pending',
    });

    if (!follow) throw new NotFoundException('Takip isteği bulunamadı.');

    await this.userFollowRepository.remove(follow);

    return { rejected: true };
  }

  async getPendingRequests(userId: number) {
    const requests = await this.userFollowRepository
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.follower', 'user')
      .select([
        'follow.id',
        'follow.follower_id',
        'follow.following_id',
        'follow.status',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.username',
        'user.photoUrl',
        'user.role',
      ])
      .where('follow.following_id = :userId', { userId })
      .andWhere('follow.status = :status', { status: 'pending' })
      .orderBy('follow.id', 'DESC')
      .getMany();

    return requests.map(req => ({
      id: req.id,
      followerId: req.follower_id,
      followingId: req.following_id,
      status: req.status,
      follower: {
        id: req.follower.id,
        firstName: req.follower.firstName,
        lastName: req.follower.lastName,
        username: req.follower.username,
        photoUrl: req.follower.photoUrl,
        role: req.follower.role
      }
    }));
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
      .andWhere('follow.status = :status', { status: 'accepted' })
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
      .andWhere('follow.status = :status', { status: 'accepted' })
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
      where: { follower_id: userId, status: 'accepted' },
    });
  }

  // Takipçi sayısını getir
  async getFollowersCount(userId: number): Promise<number> {
    return this.userFollowRepository.count({
      where: { following_id: userId, status: 'accepted' },
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
        .andWhere('follow.status = :status', { status: 'accepted' })
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

  // Karşılıklı takipleşen kullanıcıları (bağlantıları) getir
  async getConnections(userId: number): Promise<any[]> {
    const status = 'accepted';
    const connections = await this.userFollowRepository
      .createQueryBuilder('f1')
      .innerJoin(
        UserFollow,
        'f2',
        'f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id',
      )
      .leftJoinAndSelect('f1.following', 'user')
      .where('f1.follower_id = :userId', { userId })
      .andWhere('f1.status = :status', { status })
      .andWhere('f2.status = :status', { status })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .select([
        'f1.id',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.username',
        'user.photoUrl',
        'user.role'
      ])
      .getMany();

    return connections.map((f) => ({
      ...f.following,
      name: `${f.following.firstName} ${f.following.lastName}`, // Frontend expectations
      avatar: f.following.photoUrl,
      status: 'offline', // Default status, chat might update this
    }));
  }
}
