import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Country } from './country.entity';
import { Language } from '../../languages/entities/language.entity';

@Entity('country_languages')
export class CountryLanguage {
  @PrimaryColumn({ type: 'int' })
  countryId: number;

  @PrimaryColumn({ type: 'int' })
  languageId: number;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @ManyToOne(() => Country, (country) => country.countryLanguages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'countryId' })
  country: Country;

  @ManyToOne(() => Language, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'languageId' })
  language: Language;

  @CreateDateColumn()
  createdAt: Date;
}
