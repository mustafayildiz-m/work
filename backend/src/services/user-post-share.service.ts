import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPostShare } from '../entities/user-post-share.entity';
import { UserPost } from '../entities/user-post.entity';
import { ScholarPost } from '../scholars/entities/scholar-post.entity';
import { UserFollow } from '../entities/user-follow.entity';
import { CacheService } from './cache.service';

@Injectable()
export class UserPostShareService {
  constructor(
    @InjectRepository(UserPostShare)
    private userPostShareRepository: Repository<UserPostShare>,
    @InjectRepository(UserPost)
    private userPostRepository: Repository<UserPost>,
    @InjectRepository(ScholarPost)
    private scholarPostRepository: Repository<ScholarPost>,
    @InjectRepository(UserFollow)
    private userFollowRepository: Repository<UserFollow>,
    private cacheService: CacheService,
  ) {}

  // Gönderi paylaş (hem user hem scholar post'ları için)
  async sharePost(
    userId: number,
    postId: string,
    postType: 'user' | 'scholar' = 'user',
  ) {
    let postExists = false;

    // Gönderinin var olup olmadığını kontrol et
    if (postType === 'user') {
      const post = await this.userPostRepository.findOne({
        where: { id: parseInt(postId) },
      });
      postExists = !!post;
    } else if (postType === 'scholar') {
      const post = await this.scholarPostRepository.findOne({
        where: { id: postId },
      });
      postExists = !!post;
    }

    if (!postExists) {
      throw new NotFoundException('Gönderi bulunamadı');
    }

    // Zaten paylaşılmış mı kontrol et
    const existingShare = await this.userPostShareRepository.findOne({
      where: { user_id: userId, post_id: postId, post_type: postType },
    });

    if (existingShare) {
      throw new ConflictException('Bu gönderiyi zaten paylaştınız');
    }

    // Paylaşımı oluştur
    const share = this.userPostShareRepository.create({
      user_id: userId,
      post_id: postId,
      post_type: postType,
    });

    const savedShare = await this.userPostShareRepository.save(share);
    await this.clearTimelineCacheForUser(userId);
    return {
      success: true,
      message: 'Gönderi başarıyla paylaşıldı',
      share: savedShare,
    };
  }

  // Paylaşımı kaldır (hem user hem scholar post'ları için)
  async unsharePost(
    userId: number,
    postId: string,
    postType: 'user' | 'scholar' = 'user',
  ) {
    const share = await this.userPostShareRepository.findOne({
      where: { user_id: userId, post_id: postId, post_type: postType },
    });

    if (!share) {
      throw new NotFoundException('Bu gönderiyi paylaşmamışsınız');
    }

    await this.userPostShareRepository.remove(share);
    await this.clearTimelineCacheForUser(userId);
    return { success: true, message: 'Paylaşım kaldırıldı' };
  }

  // Kullanıcının paylaşımlarını getir
  async getUserShares(userId: number, limit: number = 20, offset: number = 0) {
    const [shares, total] = await this.userPostShareRepository.findAndCount({
      where: { user_id: userId },
      relations: ['post', 'post.user'],
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' },
    });

    return {
      shares,
      total,
      hasMore: offset + limit < total,
    };
  }

  // Gönderinin paylaşım sayısını getir (hem user hem scholar post'ları için)
  async getPostShareCount(
    postId: string,
    postType: 'user' | 'scholar' = 'user',
  ) {
    return await this.userPostShareRepository.count({
      where: { post_id: postId, post_type: postType },
    });
  }

  // Kullanıcı bu gönderiyi paylaşmış mı kontrol et (hem user hem scholar post'ları için)
  async isPostSharedByUser(
    userId: number,
    postId: string,
    postType: 'user' | 'scholar' = 'user',
  ) {
    const share = await this.userPostShareRepository.findOne({
      where: { user_id: userId, post_id: postId, post_type: postType },
    });

    return !!share;
  }

  private async clearTimelineCacheForUser(userId: number) {
    const languages = ['tr', 'en', 'ar'];

    for (const lang of languages) {
      const cacheKey = `user-posts:timeline:${userId}:${lang}:v4`;
      await this.cacheService.del(cacheKey);
    }

    const followers = await this.userFollowRepository.find({
      where: { following_id: userId },
      select: ['follower_id'],
    });

    for (const follower of followers) {
      for (const lang of languages) {
        const cacheKey = `user-posts:timeline:${follower.follower_id}:${lang}:v4`;
        await this.cacheService.del(cacheKey);
      }
    }
  }
}
