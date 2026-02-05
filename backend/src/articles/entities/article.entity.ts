import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Book } from '../../books/entities/book.entity';
import { ArticleTranslation } from './article-translation.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bookId: number;

  @Column({ nullable: true })
  author: string;

  @Column({ type: 'date', nullable: true })
  publishDate: Date;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @OneToMany(() => ArticleTranslation, (translation) => translation.article, {
    cascade: true,
    eager: true,
  })
  translations: ArticleTranslation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
