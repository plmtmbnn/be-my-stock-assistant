/* eslint-disable no-unsafe-finally */
import { thousandSeparator } from '../helper/util';
import moment from 'moment';
import FormData = require('form-data');
const { default: axios } = require('axios');

export class SbService {
  static async writePost (ctx: any): Promise<void> {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ' | ', ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.from.username, '-', ctx.message.text, '-', ctx.message.from.id);
    const stockCode = ctx.match[1].toUpperCase();
    console.log('ctx.match', ctx.match);

    let message = '...';
    const orderbookMessage = '';
    try {
      await this.requestWriteApost(stockCode);
      message = 'Wrote a post on stockbit';
    } catch (error) {
      message = 'Beli saat merah, jual di lebih merah.';
      console.log('ERROR [responseBot]', error);
    } finally {
      ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
    }
  }

  static async requestWriteApost (stockCode: string): Promise<any> {
    let result = null;

    const formData: any = new FormData();
    formData.append('content', 'Lets start the journey $IHSG');

    try {
      const URL: string = 'https://api.stockbit.com/v2.4/stream/write';
      const response: any = await axios({
        method: 'POST',
        url: URL,
        headers: {
          authorization: 'Bearer ' + process.env.SB_TOKEN,
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
        },
        data: formData
      });
      console.log('response.data', response.data);

      if (response.data &&
        Object.keys(response.data).length > 0 &&
        response.data.message === 'Stream post published successfully') {
        result = response.data;
      }
    } catch (error) {
      console.log('ERROR CALL AXIOS', error);
    } finally {
      return result;
    }
  }
}
