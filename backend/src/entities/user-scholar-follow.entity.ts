import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Scholar } from '../scholars/entities/scholar.entity';

@Entity('user_scholar_follows')
export class UserScholarFollow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number; // Takip eden kullanıcı

  @Column()
  scholar_id: number; // Takip edilen scholar

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Scholar, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scholar_id' })
  scholar: Scholar;
}
