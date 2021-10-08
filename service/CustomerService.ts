/* eslint-disable no-unsafe-finally */
import moment from 'moment';
import { Request, Response } from 'express';

import { userQuery } from '../sequlize/query/UserQuery';
import { sequelize } from '../sequlize/init';

export class CustomerService {
  static async registerNewUser (ctx: any): Promise<void> {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ' | ', ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
    let message = '';

    const transaction: any = await sequelize.transaction();

    try {
      const data: any = await userQuery.findAndCountAll({ telegramId: '' + ctx.message.from.id }, [], transaction);
      if (data.count === 0) {
        await userQuery.insert({
          telegramId: '' + ctx.message.from.id,
          telegramUsername: ctx.message.from.first_name
        }, transaction);
        message = 'Perdaftaran berhasil.';
      } else {
        message = 'Kamu sudah terdaftar.';
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      message = 'Beli saat merah, jual di lebih merah. Sorry ada error.';
      console.log('ERROR [responseBot]', error);
    } finally {
      ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
    }
  }

  async verify (req: Request, res: Response): Promise<any> {
    const transaction: any = await sequelize.transaction();
    try {
      const data: any = await userQuery.findAndCountAll({ telegramId: '' + req.body.telegramId }, [], transaction);
      if (data.count > 0) {
        await userQuery.update(
          {
            status: true
          },
          {
            telegramId: '' + req.body.telegramId
          }, transaction);
        await transaction.commit();
        res.status(200).json({
          status: 'OK',
          message: 'OK'
        });
      } else {
        res.status(200).json({
          status: 'NOK',
          message: 'USER_NOT_FOUND'
        });
      }
    } catch (error) {
      await transaction.rollack();
      console.log('[WatchlistService][getWatchlist]', error);
      res.status(500).json({
        status: 'NOK',
        message: 'NOK'
      });
    }
  }
}
