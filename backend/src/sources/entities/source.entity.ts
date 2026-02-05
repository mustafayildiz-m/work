import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Scholar } from '../../scholars/entities/scholar.entity';

@Entity('sources')
export class Source {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  url: string;

  @ManyToOne(() => Scholar, (scholar) => scholar.sources, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'scholar_id' })
  scholar: Scholar;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
