import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Language } from '../../languages/entities/language.entity';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 2, unique: true })
  alpha2: string;

  @Column({ type: 'char', length: 3, nullable: true })
  alpha3: string | null;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 120, nullable: true, name: 'nameTr' })
  nameTr: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  flagUrl: string | null;

  @Column({ type: 'int', nullable: true, name: 'primaryLanguageId' })
  primaryLanguageId: number | null;

  @ManyToOne(() => Language, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'primaryLanguageId' })
  primaryLanguage: Language | null;

  @Column({ type: 'int', default: 0, name: 'displayOrder' })
  displayOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
