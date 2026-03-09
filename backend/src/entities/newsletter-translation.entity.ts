import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Newsletter } from './newsletter.entity';

@Entity('newsletter_translations')
@Index(['newsletterId', 'languageCode'], { unique: true })
export class NewsletterTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  newsletterId: number;

  @Column({ type: 'varchar', length: 10 })
  languageCode: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  intro: string | null;

  @Column({ type: 'longtext', nullable: true })
  content: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Newsletter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'newsletterId' })
  newsletter: Newsletter;
}
