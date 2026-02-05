import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPostShare } from '../entities/user-post-share.entity';
import { UserPost } from '../entities/user-post.entity';
import { ScholarPost } from '../scholars/entities/scholar-post.entity';

@Injectable()
export class UserPostShareService {
  constructor(
    @InjectRepository(UserPostShare)
    private userPostShareRepository: Repository<UserPostShare>,
    @InjectRepository(UserPost)
    private userPostRepository: Repository<UserPost>,
    @InjectRepository(ScholarPost)
    private scholarPostRepository: Repository<ScholarPost>,
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
      throw new Error('Gönderi bulunamadı');
    }

    // Zaten paylaşılmış mı kontrol et
    const existingShare = await this.userPostShareRepository.findOne({
      where: { user_id: userId, post_id: postId, post_type: postType },
    });

    if (existingShare) {
      throw new Error('Bu gönderiyi zaten paylaştınız');
    }

    // Paylaşımı oluştur
    const share = this.userPostShareRepository.create({
      user_id: userId,
      post_id: postId,
      post_type: postType,
    });

    const savedShare = await this.userPostShareRepository.save(share);
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
      throw new Error('Bu gönderiyi paylaşmamışsınız');
    }

    await this.userPostShareRepository.remove(share);
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
}
