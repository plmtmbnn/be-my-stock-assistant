import { BaseService } from './BaseService';
import { Request, Response } from 'express';
import { TelegramConnection } from '../connection/telegram.connection';
import { tickedNumber } from '../helper/util';
import RedisController from '../redis/redis';

export class ScreenerService extends BaseService {
  async n3yScreener (req: Request, res: Response): Promise<any> {
    try {
      const telegramConnection = new TelegramConnection();
      const bot: any = await telegramConnection.getAccess();
      this.messageHandler(req.body, bot);
    } catch (error) {
      console.log('[ScreenerService][n3yScreener]', error);
    }
    res.status(200).json({
      status: 'OK',
      message: 'OK'
    });
  }

  async n3yScreenerSupportAndResist (req: Request, res: Response): Promise<any> {
    try {
      this.messageHandler(req.body);
    } catch (error) {
      console.log('[ScreenerService][n3yScreenerSupportAndResist]', error);
    }
    res.status(200).json({
      status: 'OK',
      message: 'OK'
    });
  }

  async messageHandler (payload: any, bot?: any) {
    const stockName = payload.stockName;

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
      if (bot) {
        bot.telegram.sendMessage('-1001565164855', message);
        // bot.telegram.sendMessage('885632184', message);
      }

      return message;
    } else {
      return null;
    }
  }

  async defineSupportAndResistance (payload: any): Promise<any> {
    try {
      const closePrice: number = payload.close;
      const vwap: number = payload.vwap;
      const MA20: string = payload.MA20;
      const MA50: string = payload.MA50;
      const MA200: string = payload.MA200;
      const score: string = payload.score;
      const BBStatus: string = payload.BBStatus;
      const ShortStatus: string = payload.ShortStatus;
      const MidStatus: string = payload.MidStatus;
      const LongStatus: string = payload.LongStatus;
      const MACDStatus: string = payload.MACDStatus;
      const AroonStatus: string = payload.AroonStatus;
      const StochKStatus: string = payload.StochKStatus;
      const RSIStatus: string = payload.RSIStatus;
      const MFIStatus: string = payload.MFIStatus;
      const signalStatus: string = payload.signalStatus;

      delete payload.stockName;
      delete payload.close;
      delete payload.sd2;
      delete payload.rd1;
      delete payload.rd2;
      delete payload.vwap;
      delete payload.MA20;
      delete payload.MA200;
      delete payload.MA200;
      delete payload.score;
      delete payload.BBStatus;
      delete payload.ShortStatus;
      delete payload.MidStatus;
      delete payload.LongStatus;
      delete payload.MACDStatus;
      delete payload.AroonStatus;
      delete payload.StochKStatus;
      delete payload.RSIStatus;
      delete payload.MFIStatus;
      delete payload.signalStatus;

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
        if (lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.01) >= closePrice) {
          higherBuyAreaPrice = lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.005);
          while (lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.01) >= closePrice) {
            delete lowerThanClosePrice[lowerBuyAreaPrice];
            lowerThanClosePriceArray = [...(Object.values(lowerThanClosePrice))];
            lowerBuyAreaPrice = Math.max(...lowerThanClosePriceArray);
            higherBuyAreaPrice = lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.005);
          }
        } else {
          higherBuyAreaPrice = lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.005);
        }
      } else {
        if ((vwap - closePrice) / closePrice * 100 > -1) {
          if (lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.01) > closePrice) {
            while (lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.01) >= closePrice || (vwap <= lowerBuyAreaPrice || (lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.01)) >= vwap)) {
              delete lowerThanClosePrice[lowerBuyAreaPrice];
              lowerThanClosePriceArray = [...(Object.values(lowerThanClosePrice))];
              lowerBuyAreaPrice = Math.max(...lowerThanClosePriceArray);
              higherBuyAreaPrice = lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.005);
            }
            higherBuyAreaPrice = lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.008);
          } else {
            higherBuyAreaPrice = lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.005);
          }
        } else {
          if (lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.01) > closePrice) {
            while (lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.01) >= closePrice || (vwap <= lowerBuyAreaPrice || (lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.01)) >= vwap)) {
              delete lowerThanClosePrice[lowerBuyAreaPrice];
              lowerThanClosePriceArray = [...(Object.values(lowerThanClosePrice))];
              lowerBuyAreaPrice = Math.max(...lowerThanClosePriceArray);
              higherBuyAreaPrice = lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.005);
            }
            higherBuyAreaPrice = lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.008);
          } else {
            higherBuyAreaPrice = lowerBuyAreaPrice + (lowerBuyAreaPrice * 0.005);
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
        if (percentageResistance1 < 4 &&
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
        if (((resistance2 - resistance1) / resistance1 * 100) < 4 &&
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
        higherBuyAreaPrice,
        MA20,
        MA50,
        MA200,
        score,
        BBStatus,
        ShortStatus,
        MidStatus,
        LongStatus,
        MACDStatus,
        AroonStatus,
        StochKStatus,
        RSIStatus,
        MFIStatus,
        signalStatus
      };
    } catch (error) {
      console.log('[ScreenerService][defineSupportAndResistance]', error);
      return null;
    }
  }
}
