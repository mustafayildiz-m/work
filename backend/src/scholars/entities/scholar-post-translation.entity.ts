import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ScholarPost } from './scholar-post.entity';

export enum TranslationStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
}

@Entity('scholar_post_translations')
export class ScholarPostTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ScholarPost, (post) => post.translations, {
    onDelete: 'CASCADE',
  })
  post: ScholarPost;

  @Column()
  postId: string;

  @Column({ type: 'varchar', length: 5 })
  language: string; // 'tr', 'en', 'ar', 'de'

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'simple-array', nullable: true })
  mediaUrls: string[];

  @Column({ type: 'simple-array', nullable: true })
  fileUrls: string[];

  @Column({
    type: 'enum',
    enum: TranslationStatus,
    nullable: true,
  })
  status?: TranslationStatus;

  @Column({ nullable: true })
  translatedBy: number; // moderator user id

  @Column({ nullable: true })
  approvedBy: number; // moderator user id

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
