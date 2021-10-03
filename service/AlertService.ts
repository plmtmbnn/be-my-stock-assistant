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
          let stockResult: any = await redis.getValue(key);
          if (stockResult) {
            stockResult = JSON.parse(stockResult);
            this.startNotifyMe(
              key,
              stockResult.resistance1,
              stockResult.resistance2,
              stockResult.resistance3,
              stockResult.support1,
              stockResult.support2,
              stockResult.lowerBuyAreaPrice,
              stockResult.higherBuyAreaPrice,
              bot);
          }
        }
      }
    } catch (error) {
      console.log('[AlertService][notifWhenPriceOnSupportOrResistance]', error);
    }
  }

  static async startNotifyMe (
    stockCode: string,
    resistance1: number,
    resistance2: number,
    resistance3: number,
    support1: number,
    support2: number,
    lowerBuyAreaPrice: number,
    higherBuyAreaPrice: number,
    bot: any
  ): Promise<void> {
    try {
      let isAlertActive: boolean = false;
      let message: string = null;
      const data = await this.requestOrderbook(stockCode);
      if (data) {
        const closePrice: number = parseInt(data.close);
        if (resistance1 === closePrice ||
          (((resistance1 - closePrice) / closePrice * 100 > -1) &&
          ((resistance1 - closePrice) / closePrice * 100 < 1))
        ) {
          isAlertActive = true;
          message = `$${stockCode} berada di area resistance1 \n\nLast Price: ${closePrice}\nR1: ${resistance1}`;
        }
        if (resistance2 === closePrice ||
          (((resistance2 - closePrice) / closePrice * 100 > -1) &&
          ((resistance2 - closePrice) / closePrice * 100 < 1))
        ) {
          isAlertActive = true;
          message = `$${stockCode} berada di area resistance2 \n\nLast Price: ${closePrice}\nR2: ${resistance2}`;
        }
        if (resistance3 === closePrice ||
          (((resistance3 - closePrice) / closePrice * 100 > -1) &&
          ((resistance3 - closePrice) / closePrice * 100 < 1))
        ) {
          isAlertActive = true;
          message = `$${stockCode} berada di area resistance3 \n\nLast Price: ${closePrice}\nR3: ${resistance3}`;
        }
        if (support1 === closePrice ||
          (((support1 - closePrice) / closePrice * 100 > -1) &&
          ((support1 - closePrice) / closePrice * 100 < 1))
        ) {
          isAlertActive = true;
          message = `$${stockCode} berada di area support1 \n\nLast Price: ${closePrice}\nS1: ${support1}`;
        }
        if (support2 === closePrice ||
          (((support2 - closePrice) / closePrice * 100 > -1) &&
          ((support2 - closePrice) / closePrice * 100 < 1))
        ) {
          isAlertActive = true;
          message = `$${stockCode} berada di area support2 \n\nLast Price: ${closePrice}\nS2: ${support2}`;
        }

        if (
          (lowerBuyAreaPrice === closePrice ||
          (((lowerBuyAreaPrice - closePrice) / closePrice * 100 > -1) &&
          ((lowerBuyAreaPrice - closePrice) / closePrice * 100 < 1))
          ) ||
          (higherBuyAreaPrice === closePrice ||
            (((higherBuyAreaPrice - closePrice) / closePrice * 100 > -1) &&
            ((higherBuyAreaPrice - closePrice) / closePrice * 100 < 1))
          )
        ) {
          isAlertActive = true;
          message = `$${stockCode} berada di area best buy \n\nLast Price: ${closePrice}\nBest Buy: ${lowerBuyAreaPrice + ' ' + higherBuyAreaPrice}`;
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
