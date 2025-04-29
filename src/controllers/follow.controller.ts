import { Request, Response } from 'express';
import { Follow } from '../entities/Follow';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';

export class FollowController {
  private followRepository = AppDataSource.getRepository(Follow);
  private userRepository = AppDataSource.getRepository(User);

  async getAllFollows(req: Request, res: Response) {
    try {
      const follows = await this.followRepository.find({
        where: { isActive: true },
        relations: ['follower', 'following'],
      });
      res.json(follows);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching follows', error });
    }
  }

  async getFollowById(req: Request, res: Response) {
    try {
      const follow = await this.followRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['follower', 'following'],
      });
      
      if (!follow) {
        return res.status(404).json({ message: 'Follow relationship not found' });
      }
      
      res.json(follow);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching follow', error });
    }
  }

  async createFollow(req: Request, res: Response) {
    try {
      // Verify both users exist
      const followerExists = await this.userRepository.findOneBy({
        id: req.body.followerId,
      });
      
      const followingExists = await this.userRepository.findOneBy({
        id: req.body.followingId,
      });
      
      if (!followerExists) {
        return res.status(400).json({ message: 'Follower user does not exist' });
      }
      
      if (!followingExists) {
        return res.status(400).json({ message: 'Following user does not exist' });
      }
      
      // Check if follow relationship already exists
      const existingFollow = await this.followRepository.findOne({
        where: {
          followerId: req.body.followerId,
          followingId: req.body.followingId,
          isActive: true,
        },
      });
      
      if (existingFollow) {
        return res.status(400).json({ message: 'Follow relationship already exists' });
      }
      
      const follow = this.followRepository.create(req.body);
      const result = await this.followRepository.save(follow);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating follow relationship', error });
    }
  }

  async deleteFollow(req: Request, res: Response) {
    try {
      const result = await this.followRepository.delete(parseInt(req.params.id));
      
      if (result.affected === 0) {
        return res.status(404).json({ message: 'Follow relationship not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting follow relationship', error });
    }
  }

  // Additional endpoint to unfollow a user directly
  async unfollowUser(req: Request, res: Response) {
    try {
      const { followerId, followingId } = req.body;
      
      if (!followerId || !followingId) {
        return res.status(400).json({ message: 'Both followerId and followingId are required' });
      }
      
      // Find the follow relationship first
      const follow = await this.followRepository.findOne({
        where: {
          followerId: followerId,
          followingId: followingId,
          isActive: true,
        },
      });
      
      if (!follow) {
        return res.status(404).json({ message: 'Follow relationship not found' });
      }
      
      // Update instead of delete
      follow.isActive = false;
      follow.unfollowedAt = new Date();
      await this.followRepository.save(follow);
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error unfollowing user', error });
    }
  }
} 