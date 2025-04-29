import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';

@Entity('follows')
@Index(['followerId', 'followingId', 'isActive'], { unique: true })
export class Follow {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  followerId: number;

  @Column()
  followingId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'followingId' })
  following: User;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  unfollowedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
} 