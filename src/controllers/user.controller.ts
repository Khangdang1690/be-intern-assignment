import { Request, Response } from 'express';
import { User } from '../entities/User';
import { Follow } from '../entities/Follow';
import { AppDataSource } from '../data-source';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private followRepository = AppDataSource.getRepository(Follow);

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
}
