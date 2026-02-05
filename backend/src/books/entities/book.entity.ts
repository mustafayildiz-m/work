import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Scholar } from '../../scholars/entities/scholar.entity';
import { BookTranslation } from './book-translation.entity';
import { Stock } from '../../entities/stock.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  coverUrl: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ nullable: true })
  author: string;

  @Column({ type: 'date', nullable: true })
  publishDate: Date;

  @OneToMany(() => BookTranslation, (translation) => translation.book, {
    cascade: true,
    eager: true,
  })
  translations: BookTranslation[];

  @ManyToMany(() => Scholar, (scholar) => scholar.relatedBooks)
  scholars: Scholar[];

  @OneToMany(() => Stock, (stock) => stock.book)
  stocks: Stock[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
