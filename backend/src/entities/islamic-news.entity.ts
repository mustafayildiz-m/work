import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('islamic_news')
export class IslamicNews {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'text' })
  link: string;

  @Column({ type: 'text', nullable: true })
  image_url: string;

  @Column({ type: 'text', nullable: true })
  source_id: string;

  @Column({ type: 'text', nullable: true })
  source_name: string;

  @Column({ type: 'text', nullable: true })
  source_url: string;

  @Column({ type: 'text', nullable: true })
  language: string;

  @Column({ type: 'text', nullable: true })
  country: string;

  @Column({ type: 'text', nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  keywords: string;

  @Column({ type: 'datetime', nullable: true })
  pub_date: Date;

  @Column({ type: 'text', nullable: true })
  video_url: string;

  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  @Column({ type: 'datetime', nullable: true })
  archive_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
