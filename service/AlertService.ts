import { BaseService } from './BaseService';
import { Request, Response } from 'express';
import { TelegramConnection } from '../connection/telegram.connection';
import moment from 'moment';
import { tickedNumber } from '../helper/util';

export class AlertService extends BaseService {
  async n3yScreener (req: Request, res: Response): Promise<any> {
    try {
      const telegramConnection = new TelegramConnection();
      const bot: any = await telegramConnection.getAccess();
      this.messageHandler(req.body, bot);
    } catch (error) {
      console.log('[AlertService][n3yScreener]', error);
    }
    res.status(200).json({
      status: 'OK',
      message: 'OK'
    });
  }

  async messageHandler (payload: any, bot: any) {
    const stockName = payload.stockName;
    console.log('#' + stockName);

    const lastPrice = payload.close;
    const vwap = payload.vwap;
    const data: any = await this.defineSupportAndResistance(payload);
    if (data) {
      const message =
      `BUY:  #${stockName}\n` +
      `Last Price: ${lastPrice}\n` +
      `\nVWAP: ${tickedNumber(vwap)}\n` +
      `Best Buy: ${data.lowerBuyAreaPrice} - ${data.higherBuyAreaPrice}\n\n` +
      `R1: ${data.resistance1} (${data.percentageResistance1.toFixed(1)}%)\n` +
      `R2: ${data.resistance2} (${data.percentageResistance2.toFixed(1)}%)\n` +
      `R3: ${data.resistance3} (${data.percentageResistance3.toFixed(1)}%)\n` +
      `S1: ${data.support1} (${data.percentageSupport1.toFixed(1)}%)\n` +
      `S2: ${data.support2} (${data.percentageSupport2.toFixed(1)}%)\n` +
      '\nhttps://t.me/c/1565164855/759\n' +
      '\nDisclaimer on, your money is your responsibility\n' +
      '#WeeklyTrading\n';
      bot.telegram.sendMessage('-1001565164855', message);
      return message;
    } else {
      return null;
    }
  }

  async defineSupportAndResistance (payload: any): Promise<any> {
    try {
      const closePrice: number = payload.close;
      const vwap: number = tickedNumber(payload.vwap);

      delete payload.stockName;
      delete payload.close;
      delete payload.vwap;

      let parsedPayload: any = {};
      Object.keys(payload).map(x => {
        parsedPayload = {
          ...parsedPayload,
          [x]: tickedNumber(payload[x])
        };
      });
      let lowerBuyAreaPrice: number = 0;
      let higherBuyAreaPrice: number = 0;

      let resistance1: number = 0;
      let resistance2: number = 0;
      let resistance3: number = 0;
      let support1: number = 0;
      let support2: number = 0;

      let percentageResistance1: number = 0;
      let percentageResistance2: number = 0;
      let percentageResistance3: number = 0;
      let percentageSupport1: number = 0;
      let percentageSupport2: number = 0;

      let lowerThanClosePrice: any = {};
      Object.keys(parsedPayload).map(x => {
        if (parsedPayload[x] <= closePrice) {
          lowerThanClosePrice = {
            ...lowerThanClosePrice,
            [parsedPayload[x]]: parsedPayload[x]
          };
        }
      });
      let higherThanClosePrice: any = {};
      Object.keys(parsedPayload).map(x => {
        if (parsedPayload[x] >= closePrice &&
        ((parsedPayload[x] - closePrice) / closePrice * 100) > 1
        ) {
          higherThanClosePrice = {
            ...higherThanClosePrice,
            [parsedPayload[x]]: parsedPayload[x]
          };
        }
      });

      let lowerThanClosePriceArray: any[] = [...(Object.values(lowerThanClosePrice))];
      lowerBuyAreaPrice = Math.max(...lowerThanClosePriceArray);

      if (vwap > closePrice) {
        if (lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.01) > closePrice) {
          higherBuyAreaPrice = closePrice;
        } else {
          higherBuyAreaPrice = lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.01);
        }
      } else {
        if ((vwap - closePrice) / closePrice * 100 >= -1) {
          higherBuyAreaPrice = vwap;
        } else {
          if (lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.01) > closePrice) {
            delete lowerThanClosePrice[lowerBuyAreaPrice];
            lowerThanClosePriceArray = [...(Object.values(lowerThanClosePrice))];
            lowerBuyAreaPrice = Math.max(...lowerThanClosePriceArray);
            higherBuyAreaPrice = lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.01);
          } else {
            higherBuyAreaPrice = lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.01);
          }
        }
      }

      delete lowerThanClosePrice[lowerBuyAreaPrice];
      lowerThanClosePriceArray = [...(Object.values(lowerThanClosePrice))];

      higherBuyAreaPrice = tickedNumber(higherBuyAreaPrice);

      let higherThanClosePriceArray: any[] = [...(Object.values(higherThanClosePrice))];
      while (resistance1 === 0) {
        resistance1 = Math.min(...higherThanClosePriceArray);
        percentageResistance1 = ((resistance1 - higherBuyAreaPrice) / higherBuyAreaPrice * 100);
        delete higherThanClosePrice[resistance1];
        higherThanClosePriceArray = [...(Object.values(higherThanClosePrice))];
        if (percentageResistance1 < 2 &&
        Object.values(higherThanClosePrice).length >= 3) {
          resistance1 = 0;
          percentageResistance1 = 0;
        }
      };

      while (resistance2 === 0) {
        resistance2 = Math.min(...higherThanClosePriceArray);
        percentageResistance2 = ((resistance2 - higherBuyAreaPrice) / higherBuyAreaPrice * 100);
        delete higherThanClosePrice[resistance2];
        higherThanClosePriceArray = [...(Object.values(higherThanClosePrice))];
        if (((resistance2 - resistance1) / resistance1 * 100) < 2 &&
      Object.values(higherThanClosePrice).length >= 2) {
          resistance2 = 0;
          percentageResistance2 = 0;
        }
      };

      while (resistance3 === 0) {
        resistance3 = Math.min(...higherThanClosePriceArray);
        percentageResistance3 = ((resistance3 - higherBuyAreaPrice) / higherBuyAreaPrice * 100);
        delete higherThanClosePrice[resistance3];
        higherThanClosePriceArray = [...(Object.values(higherThanClosePrice))];
        if (((resistance3 - resistance2) / resistance2 * 100) < 10 &&
      Object.values(higherThanClosePrice).length >= 1) {
          resistance3 = 0;
          percentageResistance3 = 0;
        }
      };

      while (support1 === 0) {
        support1 = Math.max(...lowerThanClosePriceArray);
        percentageSupport1 = ((support1 - higherBuyAreaPrice) / higherBuyAreaPrice * 100);
        delete lowerThanClosePrice[support1];
        lowerThanClosePriceArray = [...(Object.values(lowerThanClosePrice))];
        if (((support1 - higherBuyAreaPrice) / higherBuyAreaPrice * 100) > -2 &&
      Object.values(lowerThanClosePrice).length >= 2) {
          support1 = 0;
          percentageSupport1 = 0;
        }
      };

      while (support2 === 0) {
        support2 = Math.max(...lowerThanClosePriceArray);
        percentageSupport2 = ((support2 - higherBuyAreaPrice) / higherBuyAreaPrice * 100);
        delete lowerThanClosePrice[support2];
        lowerThanClosePriceArray = [...(Object.values(lowerThanClosePrice))];
        if (((support2 - support1) / support1 * 100) > -2 &&
      Object.values(lowerThanClosePrice).length >= 1) {
          support2 = 0;
          percentageSupport2 = 0;
        }
      };

      return {
        resistance1,
        resistance2,
        resistance3,
        support1,
        support2,
        percentageResistance1,
        percentageResistance2,
        percentageResistance3,
        percentageSupport1,
        percentageSupport2,
        lowerBuyAreaPrice,
        higherBuyAreaPrice
      };
    } catch (error) {
      console.log('[AlertService][defineSupportAndResistance]', error);
      return null;
    }
  }
}
