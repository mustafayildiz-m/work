import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Paper } from './paper.entity';

@Entity('paper_translations')
@Index(['paperId', 'languageCode'], { unique: true })
export class PaperTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  paperId: number;

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

  @ManyToOne(() => Paper, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paperId' })
  paper: Paper;
}
