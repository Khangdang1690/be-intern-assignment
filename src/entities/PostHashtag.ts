import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('post_hashtags')
@Index(['postId'])
@Index(['hashtagId'])
@Index(['postId', 'hashtagId'], { unique: true })
export class PostHashtag {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  postId: number;

  @Column()
  hashtagId: number;

  @ManyToOne('Post', 'postHashtags')
  @JoinColumn({ name: 'postId' })
  post: any;

  @ManyToOne('Hashtag', 'postHashtags')
  @JoinColumn({ name: 'hashtagId' })
  hashtag: any;

  @CreateDateColumn()
  createdAt: Date;
}