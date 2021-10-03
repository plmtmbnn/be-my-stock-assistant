import { BaseService } from './BaseService';
import { Request, Response } from 'express';
import RedisController from '../redis/redis';

export class WatchlistService extends BaseService {
  async getWatchlist (req: Request, res: Response): Promise<any> {
    try {
      const redis: RedisController = new RedisController();
      let watchlist: any = await redis.getValue('watchlist');
      if (watchlist) {
        watchlist = JSON.parse(watchlist);
      }
      res.status(200).json({
        status: 'OK',
        message: 'OK',
        watchlist
      });
    } catch (error) {
      console.log('[WatchlistService][getWatchlist]', error);
    }
  }

  async upsertWatchlist (req: Request, res: Response): Promise<any> {
    try {
      const redis: RedisController = new RedisController();
      let watchlist: any = await redis.getValue('watchlist');

      if (watchlist) {
        watchlist = JSON.parse(watchlist);
      }

      await redis.updateValue('watchlist', JSON.stringify({ ...watchlist, ...req.body.watchlist }), 60000);
      res.status(200).json({
        status: 'OK',
        message: 'OK'
      });
    } catch (error) {
      console.log('[WatchlistService][upsertWatchlist]', error);
      res.status(500).json({
        status: 'NOK',
        message: 'SYSTEM_ERROR'
      });
    }
  }

  async deleteWatchlist (req: Request, res: Response): Promise<any> {
    try {
      const redis: RedisController = new RedisController();
      if (!req.body.isClearWatchlist) {
        let watchlist: any = await redis.getValue('watchlist');
        if (watchlist) {
          watchlist = JSON.parse(watchlist);
          for (const stockName of req.body.watchlist) {
            if (watchlist[stockName]) {
              delete watchlist[stockName];
            }
          }
          await redis.updateValue('watchlist', JSON.stringify({ ...watchlist }), 60000);
        }
      } else {
        await redis.updateValue('watchlist', JSON.stringify({ }), 60000);
      }
      res.status(200).json({
        status: 'OK',
        message: 'OK'
      });
    } catch (error) {
      console.log('[WatchlistService][deleteWatchlist]', error);
      res.status(500).json({
        status: 'NOK',
        message: 'SYSTEM_ERROR'
      });
    }
  }
}
