import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BookLanguage } from './book-language.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => BookLanguage, (bookLanguage) => bookLanguage.book)
  bookLanguages: BookLanguage[];
}
