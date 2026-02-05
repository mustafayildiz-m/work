import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Scholar } from './scholar.entity';

@Entity('scholar_own_books')
export class ScholarBook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  coverUrl: string;

  @Column({ nullable: true })
  pdfUrl: string;

  @ManyToOne(() => Scholar, (scholar) => scholar.ownBooks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'scholar_id' })
  scholar: Scholar;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
