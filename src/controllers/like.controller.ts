import { Request, Response } from 'express';
import { Like } from '../entities/Like';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { AppDataSource } from '../data-source';

export class LikeController {
  private likeRepository = AppDataSource.getRepository(Like);
  private userRepository = AppDataSource.getRepository(User);
  private postRepository = AppDataSource.getRepository(Post);

  async getAllLikes(req: Request, res: Response) {
    try {
      const likes = await this.likeRepository.find({
        relations: ['user', 'post'],
      });
      res.json(likes);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching likes', error });
    }
  }

  async getLikeById(req: Request, res: Response) {
    try {
      const like = await this.likeRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['user', 'post'],
      });
      
      if (!like) {
        return res.status(404).json({ message: 'Like not found' });
      }
      
      res.json(like);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching like', error });
    }
  }

  async createLike(req: Request, res: Response) {
    try {
      // Verify user exists
      const userExists = await this.userRepository.findOneBy({
        id: req.body.userId,
      });
      
      if (!userExists) {
        return res.status(400).json({ message: 'User does not exist' });
      }
      
      // Verify post exists
      const postExists = await this.postRepository.findOneBy({
        id: req.body.postId,
      });
      
      if (!postExists) {
        return res.status(400).json({ message: 'Post does not exist' });
      }
      
      // Check if like already exists
      const existingLike = await this.likeRepository.findOne({
        where: {
          userId: req.body.userId,
          postId: req.body.postId,
        },
      });
      
      if (existingLike) {
        return res.status(400).json({ message: 'User has already liked this post' });
      }
      
      const like = this.likeRepository.create(req.body);
      const result = await this.likeRepository.save(like);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating like', error });
    }
  }

  async deleteLike(req: Request, res: Response) {
    try {
      const result = await this.likeRepository.delete(parseInt(req.params.id));
      
      if (result.affected === 0) {
        return res.status(404).json({ message: 'Like not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting like', error });
    }
  }

  // Additional endpoint to unlike a post directly
  async unlikePost(req: Request, res: Response) {
    try {
      const { userId, postId } = req.body;
      
      if (!userId || !postId) {
        return res.status(400).json({ message: 'Both userId and postId are required' });
      }
      
      // Find the like first
      const like = await this.likeRepository.findOne({
        where: {
          userId: userId,
          postId: postId,
        },
      });
      
      if (!like) {
        return res.status(404).json({ message: 'Like not found' });
      }
      
      // Delete by the specific like ID
      const result = await this.likeRepository.delete(like.id);
      
      if (result.affected === 0) {
        return res.status(404).json({ message: 'Failed to unlike post' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error unliking post', error });
    }
  }
} 