import { Request, Response } from 'express';
import { WatchlistService } from '../service/WatchlistService';
import * as Joi from 'joi';

export class WatchlistController {
  async getWatchlist (req: Request, res: Response): Promise<void> {
    const watchlistService: WatchlistService = new WatchlistService(req, res);
    await watchlistService.getWatchlist(req, res);
  }

  async upsertWatchlist (req: Request, res: Response): Promise<void> {
    const validationSchema: any = {
      watchlist: Joi.object().required()
    };
    const validation: any = Joi.validate(req.body, validationSchema);

    if (validation.error === null) {
      const watchlistService: WatchlistService = new WatchlistService(req, res);
      await watchlistService.upsertWatchlist(req, res);
    } else {
      res.status(400).json({
        status: 'NOK',
        message: 'MISSING_DATA'
      });
    }
  }

  async upsertWatchlistAllInOne (req: Request, res: Response): Promise<void> {
    const validationSchema: any = {
      stockName: Joi.string().required()
    };
    const validation: any = Joi.validate(req.body, validationSchema);

    if (validation.error === null) {
      const watchlistService: WatchlistService = new WatchlistService(req, res);
      await watchlistService.upsertWatchlist(req, res);
    } else {
      res.status(400).json({
        status: 'NOK',
        message: 'MISSING_DATA'
      });
    }
  }

  async deleteWatchlist (req: Request, res: Response): Promise<void> {
    const validationSchema: any = {
      isClearWatchlist: Joi.boolean().required(),
      watchlist: Joi.array().items(Joi.string().optional()).optional()
    };
    const validation: any = Joi.validate(req.body, validationSchema);

    if (validation.error === null) {
      const watchlistService: WatchlistService = new WatchlistService(req, res);
      await watchlistService.deleteWatchlist(req, res);
    } else {
      res.status(400).json({
        status: 'NOK',
        message: 'MISSING_DATA'
      });
    }
  }
}

export const watchlistController = new WatchlistController();
