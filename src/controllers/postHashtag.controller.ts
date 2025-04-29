import { Request, Response } from 'express';
import { PostHashtag } from '../entities/PostHashtag';
import { Post } from '../entities/Post';
import { Hashtag } from '../entities/Hashtag';
import { AppDataSource } from '../data-source';

export class PostHashtagController {
  private postHashtagRepository = AppDataSource.getRepository(PostHashtag);
  private postRepository = AppDataSource.getRepository(Post);
  private hashtagRepository = AppDataSource.getRepository(Hashtag);

  async getAllPostHashtags(req: Request, res: Response) {
    try {
      const postHashtags = await this.postHashtagRepository.find({
        relations: ['post', 'hashtag'],
      });
      res.json(postHashtags);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post hashtags', error });
    }
  }

  async getPostHashtagById(req: Request, res: Response) {
    try {
      const postHashtag = await this.postHashtagRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['post', 'hashtag'],
      });
      
      if (!postHashtag) {
        return res.status(404).json({ message: 'Post hashtag relationship not found' });
      }
      
      res.json(postHashtag);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post hashtag', error });
    }
  }

  async createPostHashtag(req: Request, res: Response) {
    try {
      // Verify post exists
      const postExists = await this.postRepository.findOneBy({
        id: req.body.postId,
      });
      
      if (!postExists) {
        return res.status(400).json({ message: 'Post does not exist' });
      }
      
      // Verify hashtag exists
      const hashtagExists = await this.hashtagRepository.findOneBy({
        id: req.body.hashtagId,
      });
      
      if (!hashtagExists) {
        return res.status(400).json({ message: 'Hashtag does not exist' });
      }
      
      // Check if relationship already exists
      const existingPostHashtag = await this.postHashtagRepository.findOne({
        where: {
          postId: req.body.postId,
          hashtagId: req.body.hashtagId,
        },
      });
      
      if (existingPostHashtag) {
        return res.status(400).json({ message: 'This post is already tagged with this hashtag' });
      }
      
      const postHashtag = this.postHashtagRepository.create(req.body);
      const result = await this.postHashtagRepository.save(postHashtag);
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating post hashtag relationship', error });
    }
  }

  async deletePostHashtag(req: Request, res: Response) {
    try {
      const result = await this.postHashtagRepository.delete(parseInt(req.params.id));
      
      if (result.affected === 0) {
        return res.status(404).json({ message: 'Post hashtag relationship not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting post hashtag relationship', error });
    }
  }

  // Additional endpoint to remove a hashtag from a post directly
  async removeHashtagFromPost(req: Request, res: Response) {
    try {
      const { postId, hashtagId } = req.body;
      
      if (!postId || !hashtagId) {
        return res.status(400).json({ message: 'Both postId and hashtagId are required' });
      }
      
      // Find the post hashtag relationship first
      const postHashtag = await this.postHashtagRepository.findOne({
        where: {
          postId: postId,
          hashtagId: hashtagId,
        },
      });
      
      if (!postHashtag) {
        return res.status(404).json({ message: 'Post hashtag relationship not found' });
      }
      
      // Delete by the specific post hashtag ID
      const result = await this.postHashtagRepository.delete(postHashtag.id);
      
      if (result.affected === 0) {
        return res.status(404).json({ message: 'Failed to remove hashtag from post' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error removing hashtag from post', error });
    }
  }
} 