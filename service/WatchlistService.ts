import { BaseService } from './BaseService';
import { Request, Response } from 'express';
import RedisController from '../redis/redis';
import moment from 'moment';
import { userQuery } from '../sequlize/query/UserQuery';
import { sequelize } from '../sequlize/init';
import { CustomerService } from './CustomerService';

export class WatchlistService extends BaseService {
  async getWatchlist (req: Request, res: Response): Promise<any> {
    try {
      const redis: RedisController = new RedisController();
      await redis.removeValue('activeUsers');
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
      res.status(500).json({
        status: 'NOK',
        message: 'NOK'
      });
    }
  }

  static async getWatchlistCommand (ctx: any): Promise<any> {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ' | ', ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
    let message: string = '';
    try {
      const redis: RedisController = new RedisController();
      await redis.removeValue('activeUsers');
      let watchlist: any = await redis.getValue('watchlist');
      if (watchlist) {
        watchlist = JSON.parse(watchlist);
        for (const stockName of Object.keys(watchlist)) {
          message = (message !== '' ? message + ', ' : message) + stockName;
        }
      }
    } catch (error) {
      console.log('[WatchlistService][getWatchlistCommand]', error);
    } finally {
      ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
    }
  }

  static async getMyWatchlistCommand (ctx: any): Promise<any> {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ' | ', ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
    let message: string = '';
    try {
      const redis: RedisController = new RedisController();
      let watchlist: any = await redis.getValue(`wl-${ctx.message.from.id}`);
      if (watchlist) {
        watchlist = JSON.parse(watchlist);
        for (const stockName of Object.keys(watchlist)) {
          message = (message !== '' ? message + ', ' : message) + stockName;
        }
      } else {
        message = 'Watchlist Anda kosong.\n\nSilakan tambah: /add_my_wl BBCA';
      }
    } catch (error) {
      console.log('[WatchlistService][getWatchlistCommand]', error);
    } finally {
      ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
    }
  }

  static async upsertWatchlistCommand (ctx: any): Promise<any> {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ' | ', ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
    const stockCode = ctx.match[1].toUpperCase();
    let message: string = '';
    try {
      const redis: RedisController = new RedisController();
      let watchlist: any = await redis.getValue('watchlist');

      if (watchlist) {
        watchlist = JSON.parse(watchlist);
      }
      message = `${stockCode} ditambahkan ke watchlist Anda./n/n Klik /wl`;
      await redis.updateValue('watchlist', JSON.stringify({
        ...watchlist,
        [stockCode]: {}
      }), 2000000000);
    } catch (error) {
      console.log('[WatchlistService][upsertWatchlistCommand]', error);
    } finally {
      ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
    }
  }

  static async upsertMyWatchlistCommand (ctx: any): Promise<any> {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ' | ', ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
    const stockCode = ctx.match[1].toUpperCase();
    let message: string = '';
    try {
      const redis: RedisController = new RedisController();
      let watchlist: any = await redis.getValue(`wl-${ctx.message.from.id}`);

      if (watchlist) {
        watchlist = JSON.parse(watchlist);
      }
      message = `$${stockCode} ditambahkan ke watchlist Anda.\n\nKlik /my_wl `;
      await redis.updateValue(`wl-${ctx.message.from.id}`, JSON.stringify({
        ...watchlist,
        [stockCode]: {}
      }), 2000000000);
    } catch (error) {
      console.log('[WatchlistService][upsertMyWatchlistCommand]', error);
    } finally {
      ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
    }
  }

  async upsertWatchlist (req: Request, res: Response): Promise<any> {
    try {
      const redis: RedisController = new RedisController();
      let watchlist: any = await redis.getValue('watchlist');

      if (watchlist) {
        watchlist = JSON.parse(watchlist);
      }
      if (req.body.watchlist) {
        await redis.updateValue('watchlist', JSON.stringify({
          ...watchlist,
          ...req.body.watchlist
        }), 2000000000);
      } else {
        await redis.updateValue('watchlist', JSON.stringify({
          ...watchlist,
          [req.body.stockName]: {}
        }), 2000000000);
      }
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
          await redis.updateValue('watchlist', JSON.stringify({ ...watchlist }), 2000000000);
        }
      } else {
        await redis.updateValue('watchlist', JSON.stringify({ }), 2000000000);
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

  static async deleteWatchlistCommand (ctx: any): Promise<any> {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ' | ', ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
    let message: string = '';
    try {
      const redis: RedisController = new RedisController();
      await redis.removeValue('watchlist');
      message = 'Success removed.';
    } catch (error) {
      console.log('[WatchlistService][deleteWatchlistCommand]', error);
    } finally {
      ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
    }
  }

  static async updateMeFromGeneralWatchlistCommand (ctx: any, generalWlAlert: boolean): Promise<any> {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ' | ', ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
    let message: string = '';
    const transaction: any = await sequelize.transaction();
    try {
      const data: any = await userQuery.findAndCountAll({
        telegramId: ctx.message.from.id + ''
      }, [], transaction);

      if (data.count > 0) {
        await userQuery.update({ generalWlAlert }, { telegramId: ctx.message.from.id + '' }, transaction);
        await CustomerService.checkAndUpdateConsumerFacility();
        message = 'Notif watchlist general dihentikan.';
        if (generalWlAlert) {
          message = 'Anda akan menerima notif watchlist general.';
        }
        await transaction.commit();
      } else {
        message = 'Akun Anda belum terdaftar.fn\nSilakan /daftar';
      }
    } catch (error) {
      message = 'Error';
      await transaction.rollback();
      console.log('[WatchlistService][updateMeFromGeneralWatchlistCommand]', error);
    } finally {
      ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
    }
  }

  static async deleteMyWatchlistCommand (ctx: any): Promise<any> {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ' | ', ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
    let message: string = '';
    try {
      const data: any = await userQuery.findAndCountAll({
        telegramId: ctx.message.from.id + ''
      });
      if (data.count > 0) {
        const redis: RedisController = new RedisController();
        await redis.removeValue(`wl-${ctx.message.from.id}`);
        message = 'Your own watchlist cleared.';
      } else {
        message = 'Akun Anda belum terdaftar.fn\nSilakan /daftar';
      }
    } catch (error) {
      console.log('[WatchlistService][deleteWatchlistCommand]', error);
    } finally {
      ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
    }
  }
}
