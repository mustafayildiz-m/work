import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QaCategoryTranslation } from './qa-category-translation.entity';
import { QaItem } from './qa-item.entity';

@Entity('qa_categories')
export class QaCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => QaCategory, (cat) => cat.children, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentId' })
  parent: QaCategory;

  @OneToMany(() => QaCategory, (cat) => cat.parent)
  children: QaCategory[];

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  iconUrl: string;

  @OneToMany(() => QaCategoryTranslation, (t) => t.category, {
    cascade: true,
    eager: true,
  })
  translations: QaCategoryTranslation[];

  @OneToMany(() => QaItem, (item) => item.category)
  items: QaItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
