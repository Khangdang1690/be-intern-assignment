import { Request, Response } from 'express';
import { User } from '../entities/User';
import { Follow } from '../entities/Follow';
import { Post } from '../entities/Post';
import { Like } from '../entities/Like';
import { AppDataSource } from '../data-source';
import { Between, IsNull, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private followRepository = AppDataSource.getRepository(Follow);
  private postRepository = AppDataSource.getRepository(Post);
  private likeRepository = AppDataSource.getRepository(Like);

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userRepository.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOneBy({
        id: parseInt(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const user = this.userRepository.create(req.body);
      const result = await this.userRepository.save(user);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOneBy({
        id: parseInt(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      this.userRepository.merge(user, req.body);
      const result = await this.userRepository.save(user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user', error });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const result = await this.userRepository.delete(parseInt(req.params.id));
      if (result.affected === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error });
    }
  }

  async getUserFollowers(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      // Verify user exists
      const userExists = await this.userRepository.findOneBy({ id: userId });
      
      if (!userExists) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Count total followers for pagination
      const totalFollowers = await this.followRepository.count({
        where: { followingId: userId, isActive: true }
      });
      
      // Get followers with pagination and sorting
      const follows = await this.followRepository.find({
        where: { followingId: userId, isActive: true },
        relations: ['follower'],
        order: { createdAt: 'DESC' },
        skip: offset,
        take: limit
      });
      
      // Format the response
      const followers = follows.map(follow => ({
        id: follow.follower.id,
        firstName: follow.follower.firstName,
        lastName: follow.follower.lastName,
        email: follow.follower.email,
        followDate: follow.createdAt
      }));
      
      // Return followers with pagination info
      res.json({
        data: followers,
        pagination: {
          total: totalFollowers,
          limit: limit,
          offset: offset
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching followers', error });
    }
  }

  async getUserActivity(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const type = req.query.type as string | undefined;
      
      // Parse date filters if provided
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (req.query.startDate) {
        startDate = new Date(`${req.query.startDate}T00:00:00Z`);
      }
      
      if (req.query.endDate) {
        endDate = new Date(`${req.query.endDate}T23:59:59Z`);
      }

      // Verify user exists
      const userExists = await this.userRepository.findOneBy({ id: userId });
      
      if (!userExists) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Initialize empty activity array
      let activities: any[] = [];
      let totalCount = 0;
      
      // Create date filters
      const dateFilter: any = {};
      if (startDate && endDate) {
        dateFilter.createdAt = Between(startDate, endDate);
      } else if (startDate) {
        dateFilter.createdAt = MoreThanOrEqual(startDate);
      } else if (endDate) {
        dateFilter.createdAt = LessThanOrEqual(endDate);
      }
      
      // Fetch posts if type is not specified or type is 'post'
      if (!type || type === 'post') {
        const posts = await this.postRepository.find({
          where: {
            authorId: userId,
            ...dateFilter
          },
          order: { createdAt: 'DESC' },
          relations: ['author'],
        });
        
        activities = [
          ...activities,
          ...posts.map(post => ({
            type: 'post',
            id: post.id,
            content: post.content,
            user: {
              id: post.author.id,
              firstName: post.author.firstName,
              lastName: post.author.lastName,
            },
            timestamp: post.createdAt,
          }))
        ];
      }
      
      // Fetch likes if type is not specified or type is 'like'
      if (!type || type === 'like') {
        const likes = await this.likeRepository.find({
          where: {
            userId,
            ...dateFilter
          },
          order: { createdAt: 'DESC' },
          relations: ['user', 'post'],
        });
        
        activities = [
          ...activities,
          ...likes.map(like => ({
            type: 'like',
            id: like.id,
            postId: like.postId,
            user: {
              id: like.user.id,
              firstName: like.user.firstName,
              lastName: like.user.lastName,
            },
            timestamp: like.createdAt,
          }))
        ];
      }
      
      // Fetch follows if type is not specified or type is 'follow'
      if (!type || type === 'follow') {
        const follows = await this.followRepository.find({
          where: {
            followerId: userId,
            isActive: true,
            ...dateFilter
          },
          order: { createdAt: 'DESC' },
          relations: ['follower', 'following'],
        });
        
        activities = [
          ...activities,
          ...follows.map(follow => ({
            type: 'follow',
            id: follow.id,
            isActive: follow.isActive,
            user: {
              id: follow.follower.id,
              firstName: follow.follower.firstName,
              lastName: follow.follower.lastName,
            },
            following: {
              id: follow.following.id,
              firstName: follow.following.firstName,
              lastName: follow.following.lastName,
            },
            timestamp: follow.createdAt,
          }))
        ];
      }
      
      // Fetch unfollows if type is not specified or type is 'unfollow'
      if (!type || type === 'unfollow') {
        const unfollows = await this.followRepository.find({
          where: {
            followerId: userId,
            isActive: false,
            unfollowedAt: !IsNull(),
            ...dateFilter
          },
          order: { unfollowedAt: 'DESC' },
          relations: ['follower', 'following'],
        });
        
        activities = [
          ...activities,
          ...unfollows.map(unfollow => ({
            type: 'unfollow',
            id: unfollow.id,
            isActive: unfollow.isActive,
            user: {
              id: unfollow.follower.id,
              firstName: unfollow.follower.firstName,
              lastName: unfollow.follower.lastName,
            },
            following: {
              id: unfollow.following.id,
              firstName: unfollow.following.firstName,
              lastName: unfollow.following.lastName,
            },
            timestamp: unfollow.unfollowedAt,
          }))
        ];
      }
      
      // Sort all activities by timestamp in descending order
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Count total activities for pagination
      totalCount = activities.length;
      
      // Apply pagination
      activities = activities.slice(offset, offset + limit);
      
      // Return activities with pagination info
      res.json({
        data: activities,
        pagination: {
          total: totalCount,
          limit,
          offset,
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user activity', error });
    }
  }
}
