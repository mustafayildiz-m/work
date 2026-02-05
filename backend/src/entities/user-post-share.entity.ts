import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserPost } from './user-post.entity';

@Entity('user_post_shares')
@Unique(['user_id', 'post_id']) // Bir kullanıcı aynı gönderiyi sadece bir kez paylaşabilir
export class UserPostShare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number; // Paylaşan kullanıcı

  @Column()
  post_id: string; // Paylaşılan gönderi (user post ID veya scholar post UUID)

  @Column({ type: 'varchar', length: 50 })
  post_type: string; // 'user' veya 'scholar'

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => UserPost)
  @JoinColumn({ name: 'post_id' })
  post: UserPost;
}
