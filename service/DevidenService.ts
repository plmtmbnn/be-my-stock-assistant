/* eslint-disable no-unsafe-finally */
import { thousandSeparator } from '../helper/util';
import moment from 'moment';
const { default: axios } = require('axios');

export class DevidenService {
  static async getDevidendData (ctx: any): Promise<void> {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), " | ",ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
    const stockCode = ctx.match[1].toUpperCase();
    let message = '...';
    try {
      const data = await this.requestDevidendData(stockCode);
      if (data) {
        message = `${data.Code} - ${data.Name}\n\n`;
        message = message + 'History devidend:\n';
        for (let index = data.dividendList.length - 1; index >= 0; index--) {
          message = message + `${index + 1}. ${data.dividendList[index].Year} - Rp ${data.dividendList[index].ProceedInstrument}/lembar\n`;
          message = message + `Cum Date: ${data.dividendList[index].CumDate ? moment(data.dividendList[index].CumDate, 'YYYY-MM-DD').format('DD/MM/YYYY') : '-'}\n\n`;
        }
      }
    } catch (error) {
      message = 'Beli saat merah, jual di lebih merah.';
      console.log('ERROR [responseBot]', error);
    } finally {
      ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
    }
  }

  static async requestDevidendData (stockCode: string): Promise<any> {
    let result = null;
    try {
      const URL: string = `https://api.stockbit.com/v2.4/orderbook/preview/${stockCode}`;
      const response: any = await axios({
        method: 'GET',
        url: URL,
        headers: { authorization: 'Bearer ' + process.env.SB_TOKEN }
      });
      if (response.data &&
        Object.keys(response.data).length > 0 &&
        response.data.message === 'Successfully retrieved company orderbook data') {
        result = response.data.data;
      }
    } catch (error) {
      console.log('ERROR CALL AXIOS', error);
    } finally {
      return result;
    }
  }
}
