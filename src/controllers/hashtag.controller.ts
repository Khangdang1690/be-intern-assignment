import { Request, Response } from 'express';
import { Hashtag } from '../entities/Hashtag';
import { AppDataSource } from '../data-source';

export class HashtagController {
  private hashtagRepository = AppDataSource.getRepository(Hashtag);

  async getAllHashtags(req: Request, res: Response) {
    try {
      const hashtags = await this.hashtagRepository.find({
        relations: ['postHashtags'],
      });
      res.json(hashtags);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching hashtags', error });
    }
  }

  async getHashtagById(req: Request, res: Response) {
    try {
      const hashtag = await this.hashtagRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['postHashtags'],
      });

      if (!hashtag) {
        return res.status(404).json({ message: 'Hashtag not found' });
      }

      res.json(hashtag);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching hashtag', error });
    }
  }

  async createHashtag(req: Request, res: Response) {
    try {
      // Check if hashtag already exists
      const existingHashtag = await this.hashtagRepository.findOne({
        where: { name: req.body.name },
      });

      if (existingHashtag) {
        return res.status(400).json({ message: 'Hashtag with this name already exists' });
      }

      const hashtag = this.hashtagRepository.create(req.body);
      const result = await this.hashtagRepository.save(hashtag);

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating hashtag', error });
    }
  }

  async updateHashtag(req: Request, res: Response) {
    try {
      const hashtagId = parseInt(req.params.id);

      // Check if hashtag exists
      const hashtag = await this.hashtagRepository.findOneBy({
        id: hashtagId,
      });

      if (!hashtag) {
        return res.status(404).json({ message: 'Hashtag not found' });
      }

      // Check if new name already exists
      if (req.body.name) {
        const existingHashtag = await this.hashtagRepository.findOne({
          where: { name: req.body.name },
        });

        if (existingHashtag && existingHashtag.id !== hashtagId) {
          return res.status(400).json({ message: 'Hashtag with this name already exists' });
        }
      }

      // Update hashtag
      this.hashtagRepository.merge(hashtag, req.body);
      const result = await this.hashtagRepository.save(hashtag);

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating hashtag', error });
    }
  }

  async deleteHashtag(req: Request, res: Response) {
    try {
      const result = await this.hashtagRepository.delete(parseInt(req.params.id));

      if (result.affected === 0) {
        return res.status(404).json({ message: 'Hashtag not found' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting hashtag', error });
    }
  }
} 