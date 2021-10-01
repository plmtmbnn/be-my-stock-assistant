import RedisController from '../redis/redis';
const { default: axios } = require('axios');

export class AlertService {
  static async notifyWhenPriceOnSupportOrResistance (bot: any): Promise<any> {
    try {
      const redis: RedisController = new RedisController();
      let watchlist: any = await redis.getValue('watchlist');
      if (watchlist) {
        watchlist = JSON.parse(watchlist);
        for (const key of Object.keys(watchlist)) {
          console.log(watchlist[key]);
          this.startNotifyMe(key, parseInt(watchlist[key].supportPrice), parseInt(watchlist[key].resistancePrice), bot);
        }
      }
    } catch (error) {
      console.log('[AlertService][notifWhenPriceOnSupportOrResistance]', error);
    }
  }

  static async startNotifyMe (stockCode: string, supportPrice: number, resistancePrice: number, bot: any): Promise<void> {
    try {
      let isAlertActive: boolean = false;
      let message: string = null;
      const data = await this.requestOrderbook(stockCode);
      if (data) {
        const closePrice: number = parseInt(data.close);
        if (supportPrice === closePrice ||
          (((supportPrice - closePrice) / closePrice * 100 > -1) &&
          ((supportPrice - closePrice) / closePrice * 100 < 1))
        ) {
          isAlertActive = true;
          message = `$${stockCode} berada di area support\n\nLast Price: ${closePrice}\nSupport: ${supportPrice}`;
        }
        if (resistancePrice === closePrice ||
          (((resistancePrice - closePrice) / closePrice * 100 > -1) &&
          ((resistancePrice - closePrice) / closePrice * 100 < 1))
        ) {
          isAlertActive = true;
          message = `$${stockCode} berada di area resistance\n\nLast Price: ${closePrice}\nResistance: ${resistancePrice}`;
        }
        if (isAlertActive) {
          // bot.telegram.sendMessage('-1001565164855', message);
          // bot.telegram.sendMessage('-1001476739751', message);
          bot.telegram.sendMessage('885632184', message);
        }
      }
    } catch (error) {
      console.log('[AlertService][startNotifyMe]', error);
    }
  }

  static async requestOrderbook (stockCode: string): Promise<any> {
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
    }
    return result;
  }
}
