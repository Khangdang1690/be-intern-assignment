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
      // Build activity type filters
      const types = type ? [type] : ['post', 'like', 'follow', 'unfollow'];
      const queries: string[] = [];
      let params: any[] = [];
      if (types.includes('post')) params.push(userId);
      if (types.includes('like')) params.push(userId);
      if (types.includes('follow')) params.push(userId);
      if (types.includes('unfollow')) params.push(userId);
      let whereDatePost = '';
      let whereDateLike = '';
      let whereDateFollow = '';
      let whereDateUnfollow = '';
      if (startDate && endDate) {
        whereDatePost = 'AND post.createdAt BETWEEN ? AND ?';
        whereDateLike = 'AND l.createdAt BETWEEN ? AND ?';
        whereDateFollow = 'AND f.createdAt BETWEEN ? AND ?';
        whereDateUnfollow = 'AND f.unfollowedAt BETWEEN ? AND ?';
        params = params.concat([startDate.toISOString(), endDate.toISOString(), startDate.toISOString(), endDate.toISOString(), startDate.toISOString(), endDate.toISOString(), startDate.toISOString(), endDate.toISOString()]);
      } else if (startDate) {
        whereDatePost = 'AND post.createdAt >= ?';
        whereDateLike = 'AND l.createdAt >= ?';
        whereDateFollow = 'AND f.createdAt >= ?';
        whereDateUnfollow = 'AND f.unfollowedAt >= ?';
        params = params.concat([startDate.toISOString(), startDate.toISOString(), startDate.toISOString(), startDate.toISOString()]);
      } else if (endDate) {
        whereDatePost = 'AND post.createdAt <= ?';
        whereDateLike = 'AND l.createdAt <= ?';
        whereDateFollow = 'AND f.createdAt <= ?';
        whereDateUnfollow = 'AND f.unfollowedAt <= ?';
        params = params.concat([endDate.toISOString(), endDate.toISOString(), endDate.toISOString(), endDate.toISOString()]);
      }
      if (types.includes('post')) {
        queries.push(`SELECT 'post' as type, post.id as id, post.content as content, post.createdAt as timestamp, NULL as postId, NULL as isActive, NULL as followingId, NULL as followingFirstName, NULL as followingLastName, NULL as unfollowedAt FROM posts post WHERE post.authorId = ? ${whereDatePost}`);
      }
      if (types.includes('like')) {
        queries.push(`SELECT 'like' as type, l.id as id, NULL as content, l.createdAt as timestamp, l.postId as postId, NULL as isActive, NULL as followingId, NULL as followingFirstName, NULL as followingLastName, NULL as unfollowedAt FROM likes l WHERE l.userId = ? ${whereDateLike}`);
      }
      if (types.includes('follow')) {
        queries.push(`SELECT 'follow' as type, f.id as id, NULL as content, f.createdAt as timestamp, NULL as postId, f.isActive as isActive, f.followingId as followingId, u2.firstName as followingFirstName, u2.lastName as followingLastName, NULL as unfollowedAt FROM follows f LEFT JOIN users u2 ON f.followingId = u2.id WHERE f.followerId = ? AND f.isActive = 1 ${whereDateFollow}`);
      }
      if (types.includes('unfollow')) {
        queries.push(`SELECT 'unfollow' as type, f.id as id, NULL as content, f.unfollowedAt as timestamp, NULL as postId, f.isActive as isActive, f.followingId as followingId, u2.firstName as followingFirstName, u2.lastName as followingLastName, f.unfollowedAt as unfollowedAt FROM follows f LEFT JOIN users u2 ON f.followingId = u2.id WHERE f.followerId = ? AND f.isActive = 0 AND f.unfollowedAt IS NOT NULL ${whereDateUnfollow}`);
      }
      const unionQuery = queries.join(' UNION ALL ');
      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM (${unionQuery}) as all_activities`;
      const countResult = await AppDataSource.manager.query(countQuery, params);
      const totalCount = countResult[0]?.total || 0;
      // Get paginated activities
      const paginatedQuery = `${unionQuery} ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
      const paginatedParams = params.concat([limit, offset]);
      const activities = await AppDataSource.manager.query(paginatedQuery, paginatedParams);
      // Format activities
      const formatted = activities.map((a: any) => {
        if (a.type === 'post') {
          return {
            type: 'post',
            id: a.id,
            content: a.content,
            timestamp: a.timestamp,
          };
        } else if (a.type === 'like') {
          return {
            type: 'like',
            id: a.id,
            postId: a.postId,
            timestamp: a.timestamp,
          };
        } else if (a.type === 'follow') {
          return {
            type: 'follow',
            id: a.id,
            isActive: true,
            following: {
              id: a.followingId,
              firstName: a.followingFirstName,
              lastName: a.followingLastName,
            },
            timestamp: a.timestamp,
          };
        } else if (a.type === 'unfollow') {
          return {
            type: 'unfollow',
            id: a.id,
            isActive: false,
            following: {
              id: a.followingId,
              firstName: a.followingFirstName,
              lastName: a.followingLastName,
            },
            timestamp: a.unfollowedAt,
          };
        }
        return a;
      });
      res.json({
        data: formatted,
        pagination: {
          total: totalCount,
          limit,
          offset,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user activity', error });
    }
  }
}
