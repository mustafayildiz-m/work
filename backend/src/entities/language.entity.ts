import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BookLanguage } from './book-language.entity';

@Entity('languages')
export class Language {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 10, unique: true })
  code: string;

  @OneToMany(() => BookLanguage, (bookLanguage) => bookLanguage.language)
  bookLanguages: BookLanguage[];
}
