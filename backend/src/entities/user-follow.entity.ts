import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';

@Entity('user_follows')
export class UserFollow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  follower_id: number; // Takip eden kullanıcı

  @Column()
  following_id: number; // Takip edilen kullanıcı

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  following: User;
}
