import RedisController from '../redis/redis';

import { userQuery } from '../sequlize/query/UserQuery';

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
              stockResult.percentageResistance1,
              stockResult.percentageResistance2,
              stockResult.percentageResistance3,
              stockResult.percentageSupport1,
              stockResult.percentageSupport2,
              bot);
          }
        }
      }
    } catch (error) {
      console.log('[AlertService][notifWhenPriceOnSupportOrResistance]', error);
    }
  }

  static async notifySingleUserWatchlistWhenPriceOnSupportOrResistance (bot: any): Promise<any> {
    try {
      const redis: RedisController = new RedisController();
      const data: any = await userQuery.findAndCountAll({ });

      let watchlist: any = {};
      const individualWatchlist:any[] = [];

      if (data.count > 0) {
        data.rows.map(async (e: any) => {
          const x: any = e.toJSON();
          const myWatchlist:any = await redis.getValue(`wl-${x.telegramId}`);
          if (myWatchlist) {
            individualWatchlist.push(x.telegramId);
            watchlist = { ...watchlist, ...JSON.parse(myWatchlist) };
          }
        });
      }
      await redis.updateValue('individualWatchlist', JSON.stringify(individualWatchlist), 2000000000);

      if (watchlist) {
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
              stockResult.percentageResistance1,
              stockResult.percentageResistance2,
              stockResult.percentageResistance3,
              stockResult.percentageSupport1,
              stockResult.percentageSupport2,
              bot,
              true);
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
    percentageResistance1: number,
    percentageResistance2: number,
    percentageResistance3: number,
    percentageSupport1: number,
    percentageSupport2: number,
    bot: any,
    singleNotif?: boolean
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
          message = `$${stockCode} berada di area resistance1 \n\nLast Price: ${closePrice}\nR1: ${resistance1} (${percentageResistance1.toFixed(1)}%)`;
        }
        if (resistance2 === closePrice ||
          (((resistance2 - closePrice) / closePrice * 100 > -1) &&
          ((resistance2 - closePrice) / closePrice * 100 < 1))
        ) {
          isAlertActive = true;
          message = `$${stockCode} berada di area resistance2 \n\nLast Price: ${closePrice}\nR2: ${resistance2} (${percentageResistance2.toFixed(1)}%)`;
        }
        if (resistance3 === closePrice ||
          (((resistance3 - closePrice) / closePrice * 100 > -1) &&
          ((resistance3 - closePrice) / closePrice * 100 < 1))
        ) {
          isAlertActive = true;
          message = `$${stockCode} berada di area resistance3 \n\nLast Price: ${closePrice}\nR3: ${resistance3} (${percentageResistance3.toFixed(1)}%)`;
        }
        if (support1 === closePrice ||
          (((support1 - closePrice) / closePrice * 100 > -0.5) &&
          ((support1 - closePrice) / closePrice * 100 < 0.5))
        ) {
          isAlertActive = true;
          message = `$${stockCode} berada di area support1 \n\nLast Price: ${closePrice}\n\nS1: ${support1} (${percentageSupport1.toFixed(1)}%)\nS2: ${support2} (${percentageSupport2.toFixed(1)}%)`;
        } else {
          if (support1 < closePrice && ((closePrice - support1) / support1 * 100 <= -1)) {
            isAlertActive = true;
            message = `$${stockCode} jebol support1 \n\nLast Price: ${closePrice}\n\nS1: ${support1} (${percentageSupport1.toFixed(1)}%)\nS2: ${support2} (${percentageSupport2.toFixed(1)}%)`;
          }
        }
        if (support2 === closePrice ||
          (((support2 - closePrice) / closePrice * 100 > -0.5) &&
          ((support2 - closePrice) / closePrice * 100 < 0.5))
        ) {
          isAlertActive = true;
          message = `$${stockCode} berada di area support2 \n\nLast Price: ${closePrice}\n\nS2: ${support2} (${percentageSupport2.toFixed(1)}%)`;
        } else {
          if (support2 < closePrice && ((closePrice - support2) / support2 * 100 <= -1)) {
            isAlertActive = true;
            message = `$${stockCode} jebol support2 \n\nLast Price: ${closePrice}\n\nS2: ${support2}.\nCut your lose soon`;
          }
        }

        if (
          (lowerBuyAreaPrice === closePrice ||
          (((lowerBuyAreaPrice - closePrice) / closePrice * 100 > -0.4) &&
          ((lowerBuyAreaPrice - closePrice) / closePrice * 100 < 0.4))
          ) ||
          (higherBuyAreaPrice === closePrice ||
            (((higherBuyAreaPrice - closePrice) / closePrice * 100 > -0.4) &&
            ((higherBuyAreaPrice - closePrice) / closePrice * 100 < 0.4))
          )
        ) {
          isAlertActive = true;
          message = `$${stockCode} berada di area best buy \n\nLast Price: ${closePrice}\nBest Buy: ${lowerBuyAreaPrice + ' - ' + higherBuyAreaPrice}\n\nS1: ${support1} (${percentageSupport1.toFixed(1)}%)\nS2: ${support2} (${percentageSupport2.toFixed(1)}%)`;
        }

        if (isAlertActive) {
          let totalBidVolume: number = 0;
          let totalOfferVolume: number = 0;

          let total_bid = 0;
          Object.keys(data.bid).map((x) => {
            if (x.includes('price')) {
              total_bid++;
            }
          });
          let total_offer = 0;
          Object.keys(data.offer).map((x) => {
            if (x.includes('price')) {
              total_offer++;
            }
          });
          for (let index = 1; index <= total_offer; index++) {
            totalOfferVolume += parseFloat(data.offer[`volume${index}`]);
          }

          for (let index = total_bid; index >= 1; index--) {
            totalBidVolume += parseFloat(data.bid[`volume${index}`]);
          }

          message = message + `\n\nBuyers (${((totalBidVolume / (totalBidVolume + totalOfferVolume)) * 100).toFixed(0)}%) vs Sellers (${((totalOfferVolume / (totalBidVolume + totalOfferVolume)) * 100).toFixed(0)}%)`;

          const redis: RedisController = new RedisController();
          if (singleNotif) {
            let individualWatchlist:any = await redis.getValue('individualWatchlist');
            if (individualWatchlist) {
              individualWatchlist = JSON.parse(individualWatchlist);
              for (const telegramId of individualWatchlist) {
                let watchlist: any = await redis.getValue(`wl-${telegramId}`);
                if (watchlist) {
                  watchlist = JSON.parse(watchlist);
                  if (watchlist[stockCode]) {
                    bot.telegram.sendMessage(telegramId, message);
                  }
                }
              }
            }
          } else {
            const activeUserRedis:any = await redis.getValue('activeUsers');

            if (activeUserRedis) {
              const activeUserObj: any[] = JSON.parse(activeUserRedis);
              for (const telegramId of activeUserObj) {
                bot.telegram.sendMessage(telegramId, message);
              }
            }
          }
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
