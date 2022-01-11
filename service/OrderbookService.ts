/* eslint-disable no-unsafe-finally */
import { thousandSeparator } from '../helper/util';
import moment from 'moment';
import RedisController from '../redis/redis';
const { default: axios } = require('axios');

export class OrderbookService {
  static async getOrderbook (ctx: any, isDetailNeeded?: boolean): Promise<void> {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ' | ', ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.from.username, '-', ctx.message.text, '-', ctx.message.from.id);
    const stockCode = ctx.match[1].toUpperCase();
    let message = '...';
    let orderbookMessage = '';
    try {
      const data = await this.requestOrderbook(stockCode);
      if (data) {
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

        if (isDetailNeeded) {
          orderbookMessage = '\n\n===BID ORDER===\n[  Price  ||  BLot  ||  Freq  ]';
          let totalBidVolume: number = 0;
          let totalOfferVolume: number = 0;

          for (let index = total_bid; index >= 1; index--) {
            orderbookMessage = orderbookMessage + '\n| ' + data.bid[`price${index}`] + ' || ' + thousandSeparator(parseFloat(data.bid[`volume${index}`]) / 100) + ' || ' + data.bid[`que_num${index}`] + ' |';
            totalBidVolume += parseFloat(data.bid[`volume${index}`]);
          }
          if (total_bid === 0) {
            orderbookMessage = orderbookMessage + '\n--------- ARB ---------';
          }
          orderbookMessage = orderbookMessage + '\nTotal: ' + thousandSeparator(totalBidVolume / 100) + ' lot';

          orderbookMessage = orderbookMessage + '\n\n===OFFER ORDER===\n[  Price  ||  SLot  ||  Freq  ]';
          for (let index = 1; index <= total_offer; index++) {
            orderbookMessage = orderbookMessage + '\n| ' + data.offer[`price${index}`] + ' || ' + thousandSeparator(parseFloat(data.offer[`volume${index}`]) / 100) + ' || ' + data.offer[`que_num${index}`] + ' |';
            totalOfferVolume += parseFloat(data.offer[`volume${index}`]);
          }
          if (total_offer === 0) {
            orderbookMessage = orderbookMessage + '\n--------- ARA ---------';
          }
          orderbookMessage = orderbookMessage + '\nTotal: ' + thousandSeparator(totalOfferVolume / 100) + ' lot';
          orderbookMessage = orderbookMessage + `\n\nBuyers (${((totalBidVolume / (totalBidVolume + totalOfferVolume)) * 100).toFixed(0)}%) vs Sellers (${((totalOfferVolume / (totalBidVolume + totalOfferVolume)) * 100).toFixed(0)}%)`;

          const buyingPowerPercentage = ((totalBidVolume / (totalBidVolume + totalOfferVolume)) * 100);
          if (buyingPowerPercentage > 70) {
            orderbookMessage = orderbookMessage + '\nPasukan beli sudah mendominasi.';
          } else if (buyingPowerPercentage > 60 && buyingPowerPercentage < 70) {
            orderbookMessage = orderbookMessage + '\nDominasi pasukan beli cukup kuat.';
          } else if (buyingPowerPercentage > 40 && buyingPowerPercentage < 60) {
            orderbookMessage = orderbookMessage + '\nDaya beli dan tekanan jual berimbang.';
          } else {
            orderbookMessage = orderbookMessage + '\nSedang dalam tekanan jual yang cukup besar.';
          }
        }

        message = `$${data.symbol} - ${data.name}\n=============================`;
        let emoji_change = '';
        if (data.percentage_change < -4) {
          emoji_change = '🆘';
        } else if (data.percentage_change > 0 && data.percentage_change <= 6) {
          emoji_change = '⬆️';
        } else if (data.percentage_change > 6) {
          emoji_change = '🚀';
        } else if (data.percentage_change >= -2 && data.percentage_change < 0) {
          emoji_change = '⬇️';
        } else if (data.percentage_change >= -4 && data.percentage_change < -2) {
          emoji_change = '⚠️';
        } else {
          emoji_change = '😴';
        }

        message = message + `\nHarga Terakhir\t: ${data.close} (${data.change > 0 ? `+${data.change}` : data.change})`;
        message = message + `\nPerubahan\t: ${data.percentage_change}% ${emoji_change}`;
        message = message + `\nHarga Sebelum\t: ${data.previous}`;
        message = message + `\nHigh\t: ${data.high}`;
        message = message + `\nLow\t: ${data.low}`;
        if (data.tradeable === 1 || stockCode === 'IHSG') {
          message = message + `\n\nTotal Volume: ${thousandSeparator(data.volume / 100)} lot`;
          message = message + `\nTotal Transaksi: Rp ${thousandSeparator(data.value)} `;
          message = message + `\n\nDomestik ${data.domestic === '-' ? 0 : data.domestic}% vs Asing ${data.foreign === '-' ? 0 : data.foreign}%`;
          if (data.fnet !== 0) {
            message = message + `\n${data.fnet > 0 ? 'Yuhuu, asing belanja' : 'Ops, asing jualan'} Rp ${thousandSeparator(Math.abs(data.fnet))} ${data.fnet > 0 ? '😍' : '😕'}`;
          }
          message = message + `\n${orderbookMessage}`;
        } else {
          message = message + '\n=========SEDANG DALAM SUSPENSI=========';
        }
      }
    } catch (error) {
      message = 'Beli saat merah, jual di lebih merah.';
      console.log('ERROR [responseBot]', error);
    } finally {
      ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
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
    } finally {
      return result;
    }
  }

  static async getSupportResistance (ctx: any): Promise<any> {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ' | ', ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.from.username, '-', ctx.message.text, '-', ctx.message.from.id);
    const stockCode = ctx.match[1].toUpperCase();
    let message: any = null;
    try {
      const redis: RedisController = new RedisController();
      let stockResult: any = await redis.getValue(stockCode);
      if (stockResult) {
        stockResult = JSON.parse(stockResult);

        message =
        `$${stockCode}\n\nSUPPORT & RESIST:\n======================\n` +
        `R1: ${stockResult.resistance1} (${stockResult.percentageResistance1.toFixed(1)}%)\n` +
        `R2: ${stockResult.resistance2} (${stockResult.percentageResistance2.toFixed(1)}%)\n` +
        `R3: ${stockResult.resistance3} (${stockResult.percentageResistance3.toFixed(1)}%)\n` +
        `S1: ${stockResult.lowerBuyAreaPrice}  👈 \n` +
        `S2: ${stockResult.support1} (${stockResult.percentageSupport1.toFixed(1)}%)\n`;

        if (stockResult.support2) {
          message = message + `S3: ${stockResult.support2} (${stockResult.percentageSupport2.toFixed(1)}%)`;
        } else {
          message = message + 'S3: ~';
        }

        // Detail
        message = message + '\n\nINDICATORS:\n======================';

        let shortTerm: string = '';
        if (stockResult.ShortStatus === 'Bullish') {
          shortTerm = 'BULLISH 🟢';
        } else {
          if (stockResult.ShortStatus === 'Bearish') {
            shortTerm = 'BEARISH 🔴';
          } else {
            shortTerm = stockResult.ShortStatus;
          }
        }
        message = message + '\nShort Term: ' + shortTerm + '\n';

        let midTerm: string = '';
        if (stockResult.MidStatus === 'Bullish') {
          midTerm = 'BULLISH 🟢';
        } else {
          if (stockResult.MidStatus === 'Bearish') {
            midTerm = 'BEARISH 🔴';
          } else {
            midTerm = stockResult.MidStatus;
          }
        }
        message = message + 'Mid Term: ' + midTerm + '\n';

        let longTerm: string = '';
        if (stockResult.LongStatus === 'Bullish') {
          longTerm = 'BULLISH 🟢';
        } else {
          if (stockResult.LongStatus === 'Bearish') {
            longTerm = 'BEARISH 🔴';
          } else {
            longTerm = stockResult.LongStatus;
          }
        }
        message = message + 'Long Term: ' + longTerm + '\n';

        let BBStatus: string = '';
        if (stockResult.BBStatus === 'Bellow Bottom') {
          BBStatus = 'BULLISH 🟢';
        } else {
          if (stockResult.BBStatus === 'Above Top') {
            BBStatus = 'BEARISH 🔴';
          } else {
            BBStatus = stockResult.BBStatus;
          }
        }
        message = message + 'BBand: ' + BBStatus + '\n';

        let MACD: string = '';
        if (stockResult.MACDStatus === 'Bullish') {
          MACD = 'BULLISH 🟢';
        } else {
          if (stockResult.MACDStatus === 'Bearish') {
            MACD = 'BEARISH 🔴';
          } else {
            MACD = stockResult.MACDStatus;
          }
        }
        message = message + 'MACD: ' + MACD + '\n';

        let StochKStatus: string = '';
        if (stockResult.StochKStatus === 'Bullish') {
          StochKStatus = 'BULLISH 🟢';
        } else {
          if (stockResult.StochKStatus === 'Bearish') {
            StochKStatus = 'BEARISH 🔴';
          } else {
            StochKStatus = stockResult.StochKStatus;
          }
        }
        message = message + 'StochK: ' + StochKStatus + '\n';

        let AroonStatus: string = '';
        if (stockResult.AroonStatus === 'Bullish') {
          AroonStatus = 'BULLISH 🟢';
        } else {
          if (stockResult.AroonStatus === 'Bearish') {
            AroonStatus = 'BEARISH 🔴';
          } else {
            AroonStatus = stockResult.AroonStatus;
          }
        }
        message = message + 'Aroon: ' + AroonStatus + '\n';

        let RSIStatus: string = '';
        if (stockResult.RSIStatus === 'Improving') {
          RSIStatus = 'Improving 🟢';
        } else {
          if (stockResult.RSIStatus === 'Declining') {
            RSIStatus = 'Declining 🔴';
          } else {
            RSIStatus = stockResult.RSIStatus;
          }
        }
        message = message + 'RSI: ' + RSIStatus + '\n';

        let MFIStatus: string = '';
        if (stockResult.MFIStatus === 'Over sold') {
          MFIStatus = 'Oversold 🟢';
        } else {
          if (stockResult.MFIStatus === 'Overbought') {
            MFIStatus = 'Overbought 🔴';
          } else {
            MFIStatus = stockResult.MFIStatus;
          }
        }
        message = message + 'Money Flow: ' + MFIStatus + '\n';

        message = message + '\nSUMMARY:\n======================\n';
        message = message + 'Trend Score: [' + stockResult.score + ' of 9]\nNote: ' + stockResult.signalStatus + '\n';
      }
    } catch (error) {
      console.log('[OrderbookService][getSupportResistance]', error);
    } finally {
      if (!message) {
        message = 'Data tidak ditemukan';
      }
      ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
    }
  }
}
