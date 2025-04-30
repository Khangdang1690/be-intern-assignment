import { Request, Response } from 'express';
import { Post } from '../entities/Post';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Like } from '../entities/Like';

export class PostController {
  private postRepository = AppDataSource.getRepository(Post);
  private userRepository = AppDataSource.getRepository(User);

  async getAllPosts(req: Request, res: Response) {
    try {
      const posts = await this.postRepository.find({
        relations: ['author', 'likes'],
      });

      // Format posts to include like count
      const formattedPosts = posts.map(post => ({
        ...post,
        likeCount: post.likes ? post.likes.length : 0,
      }));

      res.json(formattedPosts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching posts', error });
    }
  }

  async getPostById(req: Request, res: Response) {
    try {
      const post = await this.postRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['author', 'likes'],
      });

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Format post to include like count
      const formattedPost = {
        ...post,
        likeCount: post.likes ? post.likes.length : 0,
      };

      res.json(formattedPost);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post', error });
    }
  }

  async createPost(req: Request, res: Response) {
    try {
      // Verify author exists
      const authorExists = await this.userRepository.findOneBy({
        id: req.body.authorId,
      });

      if (!authorExists) {
        return res.status(400).json({ message: 'Author does not exist' });
      }

      const post = this.postRepository.create(req.body);
      const result = await this.postRepository.save(post);

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating post', error });
    }
  }

  async updatePost(req: Request, res: Response) {
    try {
      const post = await this.postRepository.findOneBy({
        id: parseInt(req.params.id),
      });

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      this.postRepository.merge(post, req.body);
      const result = await this.postRepository.save(post);

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating post', error });
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const result = await this.postRepository.delete(parseInt(req.params.id));

      if (result.affected === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting post', error });
    }
  }

  async getPostsByHashtag(req: Request, res: Response) {
    try {
      const tag = req.params.tag;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      // Find posts with the specified hashtag
      const query = this.postRepository
        .createQueryBuilder('post')
        .innerJoinAndSelect('post.author', 'author')
        .innerJoin('post.postHashtags', 'postHashtag')
        .innerJoin('postHashtag.hashtag', 'hashtag')
        .where('LOWER(hashtag.name) = LOWER(:tagName)', { tagName: tag })
        .skip(offset)
        .take(limit);

      // Get posts with the hashtag
      const posts = await query.getMany();

      const postIds = posts.map(post => post.id);

      // Get like counts for all posts in one query
      let likeCounts: Record<number, number> = {};
      if (postIds.length > 0) {
        const likeCountsRaw = await AppDataSource.getRepository(Like)
          .createQueryBuilder('like')
          .select('like.postId', 'postId')
          .addSelect('COUNT(*)', 'likeCount')
          .where('like.postId IN (:...postIds)', { postIds })
          .groupBy('like.postId')
          .getRawMany();

        likeCounts = Object.fromEntries(
          likeCountsRaw.map(row => [Number(row.postId), parseInt(row.likeCount, 10)])
        );
      }

      // Attach likeCount to each post
      const postsWithLikes = posts.map(post => ({
        ...post,
        likeCount: likeCounts[post.id] || 0,
      }));

      res.json(postsWithLikes);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching posts by hashtag', error });
    }
  }
}