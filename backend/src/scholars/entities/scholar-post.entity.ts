import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Scholar } from './scholar.entity';
import { ScholarPostTranslation } from './scholar-post-translation.entity';

@Entity('scholar_posts')
export class ScholarPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  scholarId: number;

  @ManyToOne(() => Scholar, (scholar) => scholar.posts)
  @JoinColumn({ name: 'scholarId' })
  scholar: Scholar;

  @OneToMany(() => ScholarPostTranslation, (translation) => translation.post, {
    cascade: true,
  })
  translations: ScholarPostTranslation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
