import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Source } from '../../sources/entities/source.entity';
import { Book } from '../../books/entities/book.entity';
import { ScholarBook } from './scholar-book.entity';
import { ScholarPost } from './scholar-post.entity';

@Entity('scholars')
export class Scholar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ type: 'text', nullable: true })
  lineage: string;

  @Column({ type: 'text', nullable: true })
  birthDate: string;

  @Column({ type: 'text', nullable: true })
  deathDate: string;

  @Column({ type: 'text' })
  biography: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  locationName: string;

  @Column({ type: 'text', nullable: true })
  locationDescription: string;

  @OneToMany(() => Source, (source) => source.scholar)
  sources: Source[];

  @OneToMany(() => ScholarBook, (book) => book.scholar)
  ownBooks: ScholarBook[];

  @ManyToMany(() => Book)
  @JoinTable({
    name: 'scholar_related_books',
    joinColumn: { name: 'scholar_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'book_id', referencedColumnName: 'id' },
  })
  relatedBooks: Book[];

  @OneToMany(() => ScholarPost, (post) => post.scholar)
  posts: ScholarPost[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
