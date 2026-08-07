import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { QaTagTranslation } from './qa-tag-translation.entity';
import { QaItem } from './qa-item.entity';

@Entity('qa_tags')
export class QaTag {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => QaTagTranslation, (t) => t.tag, {
    cascade: true,
    eager: true,
  })
  translations: QaTagTranslation[];

  @ManyToMany(() => QaItem, (item) => item.tags)
  qaItems: QaItem[];

  @CreateDateColumn()
  createdAt: Date;
}
