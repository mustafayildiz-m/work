import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserPost, PostStatus } from '../entities/user-post.entity';
import { CreateUserPostDto } from '../dto/user-posts/create-user-post.dto';
import { UpdateUserPostDto } from '../dto/user-posts/update-user-post.dto';
import { UserFollow } from '../entities/user-follow.entity';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';
import { ScholarPost } from '../scholars/entities/scholar-post.entity';
import { User } from '../users/entities/user.entity';
import { Scholar } from '../scholars/entities/scholar.entity';
import { UserPostComment } from '../entities/user-post-comment.entity';
import { UserPostShare } from '../entities/user-post-share.entity';
import { CacheService } from './cache.service';

@Injectable()
export class UserPostsService {
  constructor(
    @InjectRepository(UserPost)
    private userPostRepository: Repository<UserPost>,
    @InjectRepository(UserFollow)
    private userFollowRepository: Repository<UserFollow>,
    @InjectRepository(UserScholarFollow)
    private userScholarFollowRepository: Repository<UserScholarFollow>,
    @InjectRepository(ScholarPost)
    private scholarPostRepository: Repository<ScholarPost>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Scholar)
    private scholarRepository: Repository<Scholar>,
    @InjectRepository(UserPostComment)
    private userPostCommentRepository: Repository<UserPostComment>,
    @InjectRepository(UserPostShare)
    private userPostShareRepository: Repository<UserPostShare>,
    private readonly cacheService: CacheService,
  ) { }

  async create(createUserPostDto: CreateUserPostDto) {
    const post = this.userPostRepository.create({
      ...createUserPostDto,
      status: PostStatus.PENDING, // Default olarak pending
    });
    const savedPost = await this.userPostRepository.save(post);

    // Cache'i temizle - kullanıcının kendi timeline'ı ve onu takip edenlerin timeline'ları
    await this.clearTimelineCacheForUser(savedPost.user_id);

    return savedPost;
  }

  findAll() {
    return this.userPostRepository.find();
  }

  findOne(id: number) {
    return this.userPostRepository.findOneBy({ id });
  }

  async update(id: number, updateUserPostDto: UpdateUserPostDto) {
    const post = await this.userPostRepository.findOneBy({ id });
    if (!post) throw new NotFoundException('Post not found');

    // DTO'dan status ve approved_by alanlarını çıkar (güvenlik için)
    const { status, approved_by, ...updateData } = updateUserPostDto as any;

    // Post güncellendiğinde tekrar onaya gitmesi için status'u pending yap
    // repository.update kullanarak doğrudan veritabanında güncelle
    await this.userPostRepository.update(id, {
      ...updateData,
      status: PostStatus.PENDING, // Her zaman pending yap
      approved_by: null, // Onaylayan admin bilgisini temizle
    });

    // Güncellenmiş post'u tekrar çek
    const updatedPost = await this.userPostRepository.findOneBy({ id });
    if (!updatedPost)
      throw new NotFoundException('Post not found after update');

    // Cache'i temizle
    await this.clearTimelineCacheForUser(updatedPost.user_id);

    return updatedPost;
  }

  async remove(id: number) {
    const post = await this.userPostRepository.findOneBy({ id });
    if (!post) throw new NotFoundException('Post not found');
    const userId = post.user_id;
    await this.userPostRepository.remove(post);

    // Cache'i temizle
    await this.clearTimelineCacheForUser(userId);

    return { deleted: true };
  }

  async getTimeline(userId: number, language: string = 'tr') {
    // Cache key oluştur - shared posts ve dil için v4 (optimized)
    const cacheKey = `user-posts:timeline:${userId}:${language}:v4`;

    // Önce cache'den kontrol et
    const cachedResult = await this.cacheService.get<any[]>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Cache'de yoksa veritabanından getir
    const following = await this.userFollowRepository.find({
      where: { follower_id: userId },
      select: ['following_id'],
    });
    const followingIds = following.map((f) => f.following_id);

    const scholarFollowing = await this.userScholarFollowRepository.find({
      where: { user_id: userId },
      select: ['scholar_id'],
    });
    const scholarIds = scholarFollowing.map((f) => f.scholar_id);

    // Kullanıcının kendi postlarını da dahil et
    const allUserIds = [userId, ...followingIds];

    // *** PERFORMANS OPTİMİZASYONU: Tüm postları tek sorguda al (N+1 problemi çözüldü) ***
    let allUserPosts: UserPost[] = [];

    if (allUserIds.length > 0) {
      // Tek bir sorguda tüm kullanıcıların postlarını al
      allUserPosts = await this.userPostRepository.find({
        where: {
          user_id: In(allUserIds),
          status: PostStatus.APPROVED,
        },
        order: { created_at: 'DESC' },
        take: 100, // İlk 100 post (performans için limit)
      });
    }

    // Tüm postları tarihe göre sırala - shared posts için shared_at kullan
    allUserPosts.sort((a, b) => {
      const aDate = (a as any).shared_at
        ? new Date((a as any).shared_at)
        : new Date(a.created_at);
      const bDate = (b as any).shared_at
        ? new Date((b as any).shared_at)
        : new Date(b.created_at);
      return bDate.getTime() - aDate.getTime();
    });

    const scholarPosts =
      scholarIds.length > 0
        ? await this.scholarPostRepository.find({
          where: { scholarId: In(scholarIds) },
          relations: ['scholar', 'translations'],
          order: { createdAt: 'DESC' },
          take: 50, // İlk 50 alim postu (performans için limit)
        })
        : [];

    // Shared posts'ları al - kullanıcı ve takip ettikleri tarafından paylaşılan gönderiler
    const sharedPosts = await this.userPostShareRepository.find({
      where: { user_id: In(allUserIds) },
      relations: ['user'], // Paylaşan kullanıcı bilgisi
      order: { created_at: 'DESC' },
      take: 50, // İlk 50 paylaşılan post (performans için limit)
    });

    // Shared posts'ları işle - original post bilgilerini al
    const sharedUserPosts: any[] = [];
    const sharedScholarPosts: any[] = [];

    // *** PERFORMANS OPTİMİZASYONU: Shared post ID'lerini topla ve batch query yap ***
    const sharedUserPostIds = sharedPosts
      .filter((share) => share.post_type === 'user')
      .map((share) => Number(share.post_id));

    const sharedScholarPostIds = sharedPosts
      .filter((share) => share.post_type === 'scholar')
      .map((share) => share.post_id as any);

    // Tüm shared user posts'ları tek sorguda al
    let originalUserPosts: UserPost[] = [];
    if (sharedUserPostIds.length > 0) {
      originalUserPosts = await this.userPostRepository.find({
        where: {
          id: In(sharedUserPostIds),
          status: PostStatus.APPROVED,
        },
        relations: ['user'],
      });
    }

    // Tüm shared scholar posts'ları tek sorguda al
    let originalScholarPosts: ScholarPost[] = [];
    if (sharedScholarPostIds.length > 0) {
      originalScholarPosts = await this.scholarPostRepository.find({
        where: { id: In(sharedScholarPostIds) },
        relations: ['scholar', 'translations'],
      });
    }

    // Shared posts'ları eşleştir
    for (const share of sharedPosts) {
      if (share.post_type === 'user') {
        const originalPost = originalUserPosts.find(
          (p) => p.id === Number(share.post_id),
        );
        if (originalPost) {
          sharedUserPosts.push({
            ...originalPost,
            isShared: true,
            shared_at: share.created_at,
            shared_by_user: share.user,
            original_user: originalPost.user,
          });
        }
      } else if (share.post_type === 'scholar') {
        const originalPost = originalScholarPosts.find(
          (p) => p.id === share.post_id,
        );
        if (originalPost) {
          sharedScholarPosts.push({
            ...originalPost,
            isShared: true,
            shared_at: share.created_at,
            shared_by_user: share.user,
            original_scholar: originalPost.scholar,
          });
        }
      }
    }

    // Shared posts'ları allUserPosts'a ekle
    allUserPosts.push(...sharedUserPosts);

    // Shared scholar posts'ları scholarPosts'a ekle
    scholarPosts.push(...sharedScholarPosts);

    // Scholar posts'ları da sırala - shared posts için shared_at kullan
    scholarPosts.sort((a, b) => {
      const aDate = (a as any).shared_at
        ? new Date((a as any).shared_at)
        : new Date(a.createdAt);
      const bDate = (b as any).shared_at
        ? new Date((b as any).shared_at)
        : new Date(b.createdAt);
      return bDate.getTime() - aDate.getTime();
    });

    // *** PERFORMANS OPTİMİZASYONU: Kullanıcı ve alim bilgilerini tek sorguda al ***
    const userIds = [...new Set(allUserPosts.map((p) => p.user_id))];
    const users =
      userIds.length > 0
        ? await this.userRepository.find({
          where: { id: In(userIds) },
          select: ['id', 'firstName', 'lastName', 'photoUrl', 'username', 'role'],
        })
        : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Alim bilgilerini al
    const scholarIdsForPosts = [
      ...new Set(scholarPosts.map((p) => p.scholarId)),
    ];
    const scholars =
      scholarIdsForPosts.length > 0
        ? await this.scholarRepository.find({
          where: { id: In(scholarIdsForPosts) },
          select: ['id', 'fullName', 'photoUrl'],
        })
        : [];
    const scholarMap = new Map(scholars.map((s) => [s.id, s]));

    // *** PERFORMANS OPTİMİZASYONU: Tüm postlar için yorum sayılarını tek sorguda al ***
    const userPostIds = allUserPosts.map((p) => p.id);
    let commentCounts = new Map<number, number>();

    if (userPostIds.length > 0) {
      // Raw query ile daha hızlı yorum sayısı al
      const commentCountResults = await this.userPostCommentRepository
        .createQueryBuilder('comment')
        .select('comment.post_id', 'post_id')
        .addSelect('COUNT(comment.id)', 'count')
        .where('comment.post_id IN (:...postIds)', { postIds: userPostIds })
        .groupBy('comment.post_id')
        .getRawMany();

      commentCounts = new Map(
        commentCountResults.map((r) => [r.post_id, parseInt(r.count)]),
      );
    }

    // timeAgo hesaplama fonksiyonu
    const getTimeAgo = (date: Date): string => {
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 1) return 'Az önce';
      if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
      if (diffInHours < 24) return `${diffInHours} saat önce`;
      if (diffInDays < 7) return `${diffInDays} gün önce`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} hafta önce`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} ay önce`;
      return `${Math.floor(diffInDays / 365)} yıl önce`;
    };

    // Hepsini normalize et
    const normalizedUserPosts = allUserPosts.map((p) => {
      const user = userMap.get(p.user_id);

      // Yorum sayısını map'ten al (önceden hesaplandı)
      const commentCount = commentCounts.get(p.id) || 0;

      return {
        type: (p as any).type || 'user', // Original type'ı koru
        id: p.id,
        user_id: p.user_id,
        scholar_id: null,
        content: p.content,
        title: p.title,
        image_url: p.image_url,
        video_url: (p as any).video_url,
        created_at: p.created_at,
        updated_at: p.updated_at,
        timeAgo: getTimeAgo(p.created_at),
        // Kullanıcı bilgileri
        user_name: user ? `${user.firstName} ${user.lastName}` : null,
        user_username: user ? user.username : null,
        user_photo_url: user ? user.photoUrl : null,
        user_role: user ? user.role : null,
        // Kullanıcının kendi postu mu kontrol et
        ownPost: p.user_id === userId,
        // Yorum sayısı
        comment_count: commentCount,
        // Shared post bilgileri
        isShared: (p as any).isShared || false,
        shared_at: (p as any).shared_at || null,
        shared_by_user: (p as any).shared_by_user || null,
        original_user: (p as any).original_user || null,
        // Shared profile bilgileri
        shared_profile_type: (p as any).shared_profile_type || null,
        shared_profile_id: (p as any).shared_profile_id || null,
        // Shared book bilgileri
        shared_book_id: (p as any).shared_book_id || null,
        // Shared article bilgileri
        shared_article_id: (p as any).shared_article_id || null,
        // Diğer alanlar eklenebilir
      };
    });

    const normalizedScholarPosts = scholarPosts.map((p) => {
      // scholar relation'dan doğrudan al, yoksa scholarMap'ten al
      const scholar = p.scholar || scholarMap.get(p.scholarId);

      // Seçilen dildeki çeviriyi al, yoksa Türkçe, yoksa ilk mevcut çeviri
      const translation =
        p.translations?.find((t) => t.language === language) ||
        p.translations?.find((t) => t.language === 'tr') ||
        p.translations?.[0];

      return {
        type: 'scholar',
        id: p.id,
        user_id: null,
        scholar_id: p.scholarId,
        content: translation?.content || '',
        title: null,
        image_url: null,
        video_url: null,
        mediaUrls: translation?.mediaUrls || [],
        fileUrls: translation?.fileUrls || [],
        created_at: p.createdAt,
        updated_at: p.updatedAt,
        timeAgo: getTimeAgo(p.createdAt),
        // Alim bilgileri - scholar objesi direkt relation'dan geldi
        scholar_name: scholar ? scholar.fullName : `Scholar ${p.scholarId}`,
        scholar_photo_url: scholar ? scholar.photoUrl : null,
        // Kullanıcının kendi postu mu kontrol et (alim postları için her zaman false)
        ownPost: false,
        // Shared post bilgileri
        isShared: (p as any).isShared || false,
        shared_at: (p as any).shared_at || null,
        shared_by_user: (p as any).shared_by_user || null,
        original_scholar: (p as any).original_scholar || null,
        // Çeviri bilgileri - tüm diller
        translations: p.translations || [],
        // Diğer alanlar eklenebilir
      };
    });

    const allPosts = [...normalizedUserPosts, ...normalizedScholarPosts];
    allPosts.sort((a, b) => {
      const aDate = a.shared_at
        ? new Date(a.shared_at)
        : new Date(a.created_at);
      const bDate = b.shared_at
        ? new Date(b.shared_at)
        : new Date(b.created_at);
      return bDate.getTime() - aDate.getTime();
    });

    // Cache'e kaydet - TTL 10 dakika (600 saniye)
    await this.cacheService.set(cacheKey, allPosts, 600);

    return allPosts;
  }

  async getUserPosts(userId: number, includePending: boolean = false) {
    const whereCondition: any = { user_id: userId };

    // Eğer kullanıcı kendi postlarını görüyorsa, pending olanları da dahil et
    if (includePending) {
      whereCondition.status = In([PostStatus.APPROVED, PostStatus.PENDING]);
    } else {
      whereCondition.status = PostStatus.APPROVED;
    }

    // 1. Kullanıcının kendi postlarını al
    const posts = await this.userPostRepository.find({
      where: whereCondition,
      order: { created_at: 'DESC' },
    });

    // 2. Kullanıcının paylaştığı postları al (UserPostShare)
    const shares = await this.userPostShareRepository.find({
      where: { user_id: userId },
      relations: ['user'], // Paylaşan kullanıcı
      order: { created_at: 'DESC' },
    });

    // Paylaşılan postların orijinal verilerini al (Sadece user postlar için şimdilik)
    const sharedUserPostIds = shares
      .filter((share) => share.post_type === 'user')
      .map((share) => Number(share.post_id));

    let originalSharedPosts: UserPost[] = [];
    if (sharedUserPostIds.length > 0) {
      originalSharedPosts = await this.userPostRepository.find({
        where: {
          id: In(sharedUserPostIds),
          status: PostStatus.APPROVED,
        },
        relations: ['user'], // Orijinal yazar
      });
    }

    // Paylaşımları post formatına dönüştür
    const sharedPostsMapped = shares
      .map((share) => {
        if (share.post_type === 'user') {
          // post_id string olsa bile Number'a çevirerek karşılaştır
          const original = originalSharedPosts.find(
            (p) => p.id === Number(share.post_id),
          );
          if (original) {
            return {
              ...original,
              isShared: true,
              shared_at: share.created_at,
              shared_by_user: share.user,
              original_user: original.user,
              // Orijinal postun oluşturulma tarihi de önemli
              created_at: original.created_at,
            };
          }
        }
        return null;
      })
      .filter((post): post is NonNullable<typeof post> => post !== null);

    // Tüm postları birleştir
    const allPosts = [...posts, ...sharedPostsMapped];

    // Tarihe göre sırala (Shared olanlar için shared_at, diğerleri için created_at)
    allPosts.sort((a, b) => {
      const dateA = (a as any).shared_at
        ? new Date((a as any).shared_at)
        : new Date(a.created_at);
      const dateB = (b as any).shared_at
        ? new Date((b as any).shared_at)
        : new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });

    // Kullanıcı bilgilerini al (Profil sahibi)
    const profileUser = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'firstName', 'lastName', 'photoUrl', 'username', 'role'],
    });

    // timeAgo hesaplama fonksiyonu
    const getTimeAgo = (date: Date): string => {
      const now = new Date();
      if (!date) return '';
      const diffInMs = now.getTime() - new Date(date).getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 1) return 'Az önce';
      if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
      if (diffInHours < 24) return `${diffInHours} saat önce`;
      if (diffInDays < 7) return `${diffInDays} gün önce`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} hafta önce`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} ay önce`;
      return `${Math.floor(diffInDays / 365)} yıl önce`;
    };

    return allPosts.map((post) => {
      const isShared = (post as any).isShared;
      // Post yazarı: Paylaşılan post ise orijinal yazar, yoksa profil sahibi
      const author = isShared ? (post as any).original_user : profileUser;
      const displayDate = isShared ? (post as any).shared_at : post.created_at;

      return {
        id: post.id,
        user_id: post.user_id,
        type: (post as any).type || null,
        content: post.content,
        title: post.title,
        image_url: post.image_url,
        video_url: (post as any).video_url,
        created_at: post.created_at,
        updated_at: post.updated_at,
        timeAgo: getTimeAgo(displayDate),
        status: post.status, // Status bilgisini de ekle
        // Kullanıcı bilgileri (Yazar)
        user_name: author ? `${author.firstName} ${author.lastName}` : null,
        user_username: author ? author.username : null,
        user_photo_url: author ? author.photoUrl : null,
        user_role: author ? author.role : null,
        // Kullanıcının kendi postu mu kontrol et (Görüntüleyen kişi açısından değil, profil sahibi açısından)
        // Eğer profil sahibi postu yazmışsa ownPost=true.
        // Eğer paylaşılmışsa ve orijinal yazar başkasıysa da burada post objesi orijinal post.
        // Frontend'de 'ownPost' genellikle edit/delete yetkisi için kullanılır.
        // Paylaşılan postun kendisini silebilmek için isShared kontrolü yapılmalı.
        ownPost: !isShared, // Paylaşılan post ise direct post değildir. (Aslında bu flag isCurrentUser ile frontend'de override ediliyor olabilir)
        // Shared post bilgileri
        isShared: isShared || false,
        shared_at: (post as any).shared_at || null,
        shared_by_user: (post as any).shared_by_user
          ? {
            name: `${(post as any).shared_by_user.firstName} ${(post as any).shared_by_user.lastName}`,
            photoUrl: (post as any).shared_by_user.photoUrl,
          }
          : null,
        original_user: (post as any).original_user || null,
        // Shared profile/book/article fields existing in UserPost
        shared_profile_type: (post as any).shared_profile_type || null,
        shared_profile_id: (post as any).shared_profile_id || null,
        shared_book_id: (post as any).shared_book_id || null,
        shared_article_id: (post as any).shared_article_id || null,
      };
    });
  }

  async getSharedProfileData(profileType: string, profileId: number) {
    if (profileType === 'user') {
      const user = await this.userRepository.findOne({
        where: { id: profileId },
        select: [
          'id',
          'firstName',
          'lastName',
          'photoUrl',
          'username',
          'biography',
        ],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        type: 'user',
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        username: user.username,
        photoUrl: user.photoUrl,
        biography: user.biography,
      };
    } else if (profileType === 'scholar') {
      const scholar = await this.scholarRepository.findOne({
        where: { id: profileId },
        select: [
          'id',
          'fullName',
          'photoUrl',
          'biography',
          'birthDate',
          'deathDate',
        ],
      });

      if (!scholar) {
        throw new NotFoundException('Scholar not found');
      }

      return {
        type: 'scholar',
        id: scholar.id,
        name: scholar.fullName,
        photoUrl: scholar.photoUrl,
        biography: scholar.biography,
        birthDate: scholar.birthDate,
        deathDate: scholar.deathDate,
      };
    }

    throw new NotFoundException('Invalid profile type');
  }

  async approvePost(postId: number, adminUserId: number) {
    const post = await this.userPostRepository.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');

    post.status = PostStatus.APPROVED;
    post.approved_by = adminUserId;
    const updatedPost = await this.userPostRepository.save(post);

    // Cache'i temizle
    await this.clearTimelineCacheForUser(updatedPost.user_id);

    return updatedPost;
  }

  async rejectPost(postId: number, adminUserId: number) {
    const post = await this.userPostRepository.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');

    post.status = PostStatus.REJECTED;
    post.approved_by = adminUserId;
    const updatedPost = await this.userPostRepository.save(post);

    // Cache'i temizle
    await this.clearTimelineCacheForUser(updatedPost.user_id);

    return updatedPost;
  }

  async getPendingPosts() {
    return this.userPostRepository.find({
      where: { status: PostStatus.PENDING },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Bir kullanıcı için timeline cache'ini temizler
   * Kullanıcının kendi cache'ini ve onu takip edenlerin cache'lerini temizler
   */
  private async clearTimelineCacheForUser(userId: number) {
    // Desteklenen diller
    const languages = ['tr', 'en', 'ar'];

    // Kullanıcının kendi timeline cache'ini temizle (v4)
    for (const lang of languages) {
      const cacheKey = `user-posts:timeline:${userId}:${lang}:v4`;
      await this.cacheService.del(cacheKey);
    }

    // Bu kullanıcıyı takip edenleri bul
    const followers = await this.userFollowRepository.find({
      where: { following_id: userId },
      select: ['follower_id'],
    });

    // Her takipçinin timeline cache'ini temizle
    for (const follower of followers) {
      for (const lang of languages) {
        const cacheKey = `user-posts:timeline:${follower.follower_id}:${lang}:v4`;
        await this.cacheService.del(cacheKey);
      }
    }
  }
}
