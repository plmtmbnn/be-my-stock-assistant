/* eslint-disable no-path-concat */
import { BaseService } from './BaseService';
import { Request, Response } from 'express';
import XLSX from 'xlsx';
import RedisController from '../redis/redis';
import moment from 'moment';

export class HoldingCompositionService extends BaseService {
  async writeData (req: Request, res: Response): Promise<any> {
    try {
      const redis: RedisController = new RedisController();

      const workbook = XLSX.readFile(__dirname + '\\modules\\test.txt');
      const sheet_name_list = workbook.SheetNames;
      const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
      const promiseData: any[] = [];
      for (const data of xlData) {
        const newData: any = {};
        const keys = Object.keys(data)[0].split('|');
        const values = Object.values(data)[0].split('|');
        for (let index = 0; index < keys.length; index++) {
          if (
            keys[index] === 'Date' ||
            keys[index] === 'Code' ||
            keys[index] === 'Type'
          ) {
            newData[keys[index]] = values[index];
          } else {
            newData[keys[index]] = parseFloat(values[index]);
          }
        }

        const local_IS = parseFloat((newData['Local IS'] / newData['Sec. Num'] * 100).toFixed(2));
        const local_CP = parseFloat((newData['Local CP'] / newData['Sec. Num'] * 100).toFixed(2));
        const local_PF = parseFloat((newData['Local PF'] / newData['Sec. Num'] * 100).toFixed(2));
        const local_IB = parseFloat((newData['Local IB'] / newData['Sec. Num'] * 100).toFixed(2));
        const local_ID = parseFloat((newData['Local ID'] / newData['Sec. Num'] * 100).toFixed(2));
        const local_MF = parseFloat((newData['Local MF'] / newData['Sec. Num'] * 100).toFixed(2));
        const local_SC = parseFloat((newData['Local SC'] / newData['Sec. Num'] * 100).toFixed(2));
        const local_FD = parseFloat((newData['Local FD'] / newData['Sec. Num'] * 100).toFixed(2));
        const local_OT = parseFloat((newData['Local OT'] / newData['Sec. Num'] * 100).toFixed(2));

        const foreign_IS = parseFloat((newData['Foreign IS'] / newData['Sec. Num'] * 100).toFixed(2));
        const foreign_CP = parseFloat((newData['Foreign CP'] / newData['Sec. Num'] * 100).toFixed(2));
        const foreign_PF = parseFloat((newData['Foreign PF'] / newData['Sec. Num'] * 100).toFixed(2));
        const foreign_IB = parseFloat((newData['Foreign IB'] / newData['Sec. Num'] * 100).toFixed(2));
        const foreign_ID = parseFloat((newData['Foreign ID'] / newData['Sec. Num'] * 100).toFixed(2));
        const foreign_MF = parseFloat((newData['Foreign MF'] / newData['Sec. Num'] * 100).toFixed(2));
        const foreign_SC = parseFloat((newData['Foreign SC'] / newData['Sec. Num'] * 100).toFixed(2));
        const foreign_FD = parseFloat((newData['Foreign FD'] / newData['Sec. Num'] * 100).toFixed(2));
        const foreign_OT = parseFloat((newData['Foreign OT'] / newData['Sec. Num'] * 100).toFixed(2));

        promiseData.push(this.storeRedis(redis, `HOLDING-${newData.Code}`, {
          local_IS,
          foreign_IS,
          local_CP,
          foreign_CP,
          local_PF,
          foreign_PF,
          local_IB,
          foreign_IB,
          local_ID,
          foreign_ID,
          local_MF,
          foreign_MF,
          local_SC,
          foreign_SC,
          local_FD,
          foreign_FD,
          local_OT,
          foreign_OT
        }));
      }
      await Promise.all(promiseData);
    } catch (error) {
      console.log('[HoldingCompositionService][writeData]', error);
    }
    res.status(200).json({
      status: 'OK',
      message: 'OK'
    });
  }

  async storeRedis (redis: any, key: string, value: any): Promise<any> {
    await redis.updateValue(key, JSON.stringify(value), 2000000000);
  }

  static async getHolding (ctx: any): Promise<any> {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ' | ', ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.from.username, '-', ctx.message.text, '-', ctx.message.from.id);
    const stockCode = ctx.match[1].toUpperCase();
    let message: any = null;
    try {
      const redis: RedisController = new RedisController();
      let stockResult: any = await redis.getValue(`HOLDING-${stockCode}`);
      if (stockResult) {
        stockResult = JSON.parse(stockResult);
        message = `KOMPOSISI KEPEMILIKAN $${stockCode}:\n======================\n\n` +
        '===LOKAL===\n' +
        `Asuransi Lokal: ${stockResult.local_IS}%\n` +
        `Perusahaan Lokal: ${stockResult.local_CP}%\n` +
        `Dana Pensiun Lokal: ${stockResult.local_PF}%\n` +
        `Perbankan Lokal: ${stockResult.local_IB}%\n` +
        `Individu Lokal: ${stockResult.local_ID}%\n` +
        `Reksadana Lokal: ${stockResult.local_MF}%\n` +
        `Sekuritas Lokal: ${stockResult.local_SC}%\n` +
        `Yayasan Lokal: ${stockResult.local_FD}%\n` +
        `Lainnya Lokal: ${stockResult.local_OT}%\n` +
        '\n===ASING===\n' +
        `Asuransi Asing: ${stockResult.foreign_IS}%\n` +
        `Perusahaan Asing: ${stockResult.foreign_CP}%\n` +
        `Dana Pensiun Asing: ${stockResult.foreign_PF}%\n` +
        `Perbankan Asing: ${stockResult.foreign_IB}%\n` +
        `Individu Asing: ${stockResult.foreign_ID}%\n` +
        `Reksadana Asing: ${stockResult.foreign_MF}%\n` +
        `Sekuritas Asing: ${stockResult.foreign_SC}%\n` +
        `Yayasan Asing: ${stockResult.foreign_FD}%\n` +
        `Lainnya Asing: ${stockResult.foreign_OT}%\n\n`;
      }
    } catch (error) {
      console.log('[HoldingCompositionService][getHolding]', error);
    } finally {
      if (!message) {
        message = 'Data tidak ditemukan';
      }
      ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
    }
  }
}
