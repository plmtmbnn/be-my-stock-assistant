/* eslint-disable no-unsafe-finally */
import moment from 'moment';
const { default: axios } = require('axios'); ;
export class ValuationService {
  static async getStockValuation (ctx: any, isSingleStock?: boolean): Promise<void> {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ' | ', ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
    console.log(ctx.match[1]);

    const stockCode = ctx.match[1].toUpperCase();
    let message = '...';
    try {
      const data = await this.requestStockValuation(stockCode);
      if (data) {
        if (isSingleStock) {
          message = `Valuasi $${data.Stock.Code}:\n\n`;
        } else {
          message = 'Valuasi Satu Sektor:\n\n';
        }
        for (const stock of data.PerPbvs) {
          if (isSingleStock) {
            if (stockCode === stock.Code) {
              message = message + `Harga Closing: ${stock.ClosingPrice}\n`;
              message = message + `  PBV : ${(stock.Pbv || 0).toFixed(3)}\n`;
              message = message + `  PER : ${(stock.Per || 0).toFixed(3)}\n`;
              message = message + `  ROE : ${(stock.Roe || 0).toFixed(3)}\n`;
              break;
            }
          } else {
            message = message + `Code : $${stock.Code}\n`;
            message = message + `Harga Closing: ${stock.ClosingPrice}\n`;
            message = message + `  PBV : ${(stock.Pbv || 0).toFixed(3)}\n`;
            message = message + `  PER : ${(stock.Per || 0).toFixed(3)}\n`;
            message = message + `  ROE : ${(stock.Roe || 0).toFixed(3)}\n\n`;
          }
        }
        message = message + '\nTips:';
        message = message + '\n1. Semakin rendah PBV dan PER dibanding emiten sejenis, artinya undervalued.';
        message = message + '\n2. Semakin tinggi ROE, berarti perusahaan semakin bagus karena dapat mengelola modal untuk menghasilkan modal bersih.';
        message = message + '\n3. ROE dan PER yang minus berarti perusahaan merugi, hindari untuk investasi.';
      }
    } catch (error) {
      message = 'Beli saat merah, jual di lebih merah.';
      console.log('ERROR [responseBot]', error);
    } finally {
      ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
    }
  }

  static async requestStockValuation (stockCode: string): Promise<any> {
    let result = null;
    try {
      const URL: string = `https://pasardana.id/api/StockService/StockValuationVsROE?stockCode=${stockCode}`;
      const response: any = await axios({
        method: 'GET',
        url: URL,
        headers: {
          'Accept-Encoding': 'identity',
          'Content-Type': 'application/json, text/plain, */*'
        }
      });

      if (response.data) {
        result = response.data;
      }
    } catch (error) {
      console.log('ERROR CALL AXIOS', error);
    } finally {
      return result;
    }
  }
}
