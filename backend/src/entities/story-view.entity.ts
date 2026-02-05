import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ScholarStory } from './scholar-story.entity';
import { User } from '../users/entities/user.entity';

@Entity('story_views')
@Unique(['story_id', 'user_id'])
export class StoryView {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  story_id: number;

  @Column()
  user_id: number;

  @CreateDateColumn()
  viewed_at: Date;

  @ManyToOne(() => ScholarStory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: ScholarStory;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
