/* eslint-disable no-path-concat */
/* eslint-disable no-unsafe-finally */
import moment from 'moment';
import axios from 'axios';
import { thousandSeparator } from '../helper/util';

export class CronService {
  static async getTodayAgenda (bot: any): Promise<void> {
    let message = '...';
    try {
      const data = await this.requestTodayAgenda();
      if (data) {
        message = 'Good morning kak,\n\nBerikut agenda emiten pada IHSG hari ini:\n';
        for (const symbol of Object.keys(data)) {
          if (
            symbol !== 'timezone' &&
                        symbol !== 'today' &&
                        data[symbol].length > 0) {
            message = message + `\n${symbol.toUpperCase()}:\n`;
            let emitens = '';
            for (const emiten of data[symbol]) {
              switch (symbol) {
                case 'economic':
                  if (emiten === '') {
                    emitens = `-${emiten.econcal_item}:\n`;
                    emitens = emitens + `  Sebelumnya: ${emiten.econcal_previous}\n`;
                    emitens = emitens + `  Forecast: ${emiten.econcal_forecast}\n`;
                    emitens = emitens + `  Aktual: ${emiten.econcal_actual}\n`;
                  } else {
                    emitens = emitens + `-${emiten.econcal_item}\n`;
                    emitens = emitens + `  Sebelumnya: ${emiten.econcal_previous}\n`;
                    emitens = emitens + `  Forecast: ${emiten.econcal_forecast}\n`;
                    emitens = emitens + `  Aktual: ${emiten.econcal_actual}\n`;
                  }
                  break;
                case 'ipo':
                  if (emitens === '') {
                    emitens = `-${emiten.company_name}`;
                  } else {
                    emitens = emitens + `, ${emiten.company_name}`;
                  }
                  break;
                case 'dividend':
                  emitens = emitens + `-$${emiten.company_symbol}\n`;
                  emitens = emitens + `   value: Rp ${emiten.dividend_value} / lembar saham\n`;
                  emitens = emitens + `   cumdate: ${emiten.dividend_cumdate}\n`;
                  emitens = emitens + `   exdate: ${emiten.dividend_exdate}\n`;
                  emitens = emitens + `   paydate: ${emiten.dividend_paydate}\n`;
                  break;
                case 'rups':
                  if (emitens === '') {
                    emitens = `-$${emiten.company_symbol}`;
                  } else {
                    emitens = emitens + `, $${emiten.company_symbol}`;
                  }
                  break;
                case 'rightissue':
                  emitens = emitens + `-$${emiten.company_symbol}\n`;
                  emitens = emitens + `   rasio: [${emiten.rightissue_new} : ${emiten.rightissue_old}] [new:old]\n`;
                  break;
                default:
                  if (emitens === '') {
                    emitens = `-$${emiten.company_symbol}`;
                  } else {
                    emitens = emitens + `, $${emiten.company_symbol}`;
                  }
                  break;
              }
            }
            message = message + emitens;
          }
        }
        message = message + '\n\n~BOT MORNING UPDATE';
      }
    } catch (error) {
      // message = 'Beli saat merah, jual di lebih merah.';
      console.log('ERROR [responseBot]', error);
    } finally {
      bot.telegram.sendMessage('-1001565164855', message);
      // bot.telegram.sendMessage('-1001476739751', message);
      // bot.telegram.sendMessage('885632184', message);
    }
  }

  static async requestTodayAgenda (): Promise<any> {
    let result = null;
    try {
      const URL = 'https://api.stockbit.com/v2.4/calendar';
      const response = await axios({
        method: 'GET',
        url: URL,
        headers: { authorization: 'Bearer ' + process.env.SB_TOKEN }
      });
      if (response.data &&
                Object.keys(response.data).length > 0 &&
                response.data.message === 'Successfully retrieved corporate action events for today') {
        result = response.data.data;
      }
    } catch (error) {
      console.log('ERROR CALL AXIOS', error);
    } finally {
      return result;
    }
  }

  static async getCompositeUpdate (bot: any): Promise<void> {
    let message = '...';
    try {
      const data = await this.requestCompositeUpdate();
      if (data) {
        message = `IHSG Summary ${moment().locale('ind').format('DD MMMM YYYY')}:\n`;
        let emoji_change = '';
        if (data.percentage_change < -2) {
          emoji_change = '🆘';
        } else if (data.percentage_change > 0 && data.percentage_change <= 1) {
          emoji_change = '⬆️';
        } else if (data.percentage_change > 1) {
          emoji_change = '🚀';
        } else if (data.percentage_change >= -0.9 && data.percentage_change < 0) {
          emoji_change = '⬇️';
        } else if (data.percentage_change >= -2 && data.percentage_change < -0.9) {
          emoji_change = '⚠️';
        } else {
          emoji_change = '😴';
        }
        message = message + `\nHarga Terakhir: ${data.close} (${data.change > 0 ? `+${data.change}` : data.change})`;
        message = message + `\nHarga Sebelum: ${data.previous}`;
        message = message + `\nPerubahan: ${data.percentage_change}%  ${emoji_change}`;
        message = message + `\n\nTotal Volume: ${thousandSeparator(data.volume / 100)} lot`;
        message = message + `\nTotal Transaksi: Rp ${thousandSeparator(data.value)} `;
        message = message + `\nDomestik ${data.domestic === '-' ? 0 : data.domestic}% vs Asing ${data.foreign === '-' ? 0 : data.foreign}%\n`;
        message = message + `\nFBuy: Rp ${thousandSeparator(data.fbuy)}\nFSell: Rp ${thousandSeparator(data.fsell)}`;
        message = message + `\nAsing${data.fnet > 0 ? ' belanja sebanyak Rp ' + thousandSeparator(Math.abs(data.fnet)) + ' di IHSG hari ini.' : ' membawa kabur duit Rp ' + thousandSeparator(Math.abs(data.fnet)) + ' dari IHSG hari ini.'}`;
        message = message + '\n\n~BOT SUMMARY';
      }
    } catch (error) {
      message = 'Beli saat merah, jual di lebih merah.';
      console.log('ERROR [responseBot]', error);
    } finally {
      bot.telegram.sendMessage('-1001565164855', message);
      // bot.telegram.sendMessage('-1001476739751', message);
      // bot.telegram.sendMessage('885632184', message);
    }
  }

  static async requestCompositeUpdate (): Promise<any> {
    let result = null;
    try {
      const URL = 'https://api.stockbit.com/v2.4/orderbook/preview/IHSG';
      const response = await axios({
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
