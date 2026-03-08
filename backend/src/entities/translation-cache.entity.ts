import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('translation_cache')
@Index(['sourceTextHash', 'targetLangCode', 'sourceLangCode'], { unique: true })
export class TranslationCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 32 })
  sourceTextHash: string;

  @Column({ type: 'varchar', length: 20 })
  targetLangCode: string;

  @Column({ type: 'varchar', length: 20, default: 'auto' })
  sourceLangCode: string;

  @Column({ type: 'longtext' })
  translatedText: string;

  @CreateDateColumn()
  createdAt: Date;
}
