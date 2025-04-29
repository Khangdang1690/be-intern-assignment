import { Request, Response } from 'express';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Follow } from '../entities/Follow';
import { AppDataSource } from '../data-source';
import { In } from 'typeorm';

export class FeedController {
  private userRepository = AppDataSource.getRepository(User);
  private postRepository = AppDataSource.getRepository(Post);
  private followRepository = AppDataSource.getRepository(Follow);

  // Get feed of posts from users that the current user follows
  async getFeed(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      // Validate userId exists
      const userExists = await this.userRepository.findOneBy({
        id: userId,
      });
      
      if (!userExists) {
        return res.status(400).json({ message: 'User does not exist' });
      }
      
      // Find all users that the current user actively follows
      const follows = await this.followRepository.find({
        where: { followerId: userId, isActive: true },
        select: ['followingId'],
      });
      
      // Extract the IDs of followed users
      const followingIds = follows.map(follow => follow.followingId);
      
      // If user doesn't follow anyone, return empty feed
      if (followingIds.length === 0) {
        return res.json({
          data: [],
          pagination: {
            total: 0,
            limit: limit,
            offset: offset,
          },
        });
      }
      
      // Query total count for pagination
      const total = await this.postRepository.count({
        where: { authorId: In(followingIds) },
      });
      
      // Query posts from followed users with pagination
      const posts = await this.postRepository.find({
        where: { authorId: In(followingIds) },
        relations: [
          'author',
          'likes',
          'postHashtags',
          'postHashtags.hashtag',
        ],
        order: { createdAt: 'DESC' },
        skip: offset,
        take: limit,
      });
      
      // Format the posts for response
      const formattedPosts = posts.map(post => {
        const hashtags = post.postHashtags ? 
          post.postHashtags.map(ph => ph.hashtag).filter(Boolean) : 
          [];
          
        return {
          id: post.id,
          content: post.content,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          author: {
            id: post.author.id,
            firstName: post.author.firstName,
            lastName: post.author.lastName,
          },
          likeCount: post.likes ? post.likes.length : 0,
          hashtags: hashtags,
        };
      });
      
      // Return feed with pagination info
      res.json({
        data: formattedPosts,
        pagination: {
          total,
          limit: limit,
          offset: offset,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching feed', error });
    }
  }
} 