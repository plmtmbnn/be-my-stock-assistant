/* eslint-disable no-path-concat */
/* eslint-disable no-unsafe-finally */
const moment = require('moment');
const { execFile } = require('child_process');
export class ChartService {
  static async getChartImage (ctx: any, bot: any): Promise<void> {
    console.log(ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
    const command = ctx.match.input.split(' ')[0];
    let documentIndex = 0; let sheetIndex = 0;
    switch (command) {
      case '/n3y':
        documentIndex = 0;
        sheetIndex = 0;
        break;
      case '/cn3y':
        documentIndex = 0;
        sheetIndex = 0;
        break;
      case '/super':
        documentIndex = 0;
        sheetIndex = 1;
        break;
      case '/trend':
        documentIndex = 0;
        sheetIndex = 2;
        break;
      case '/follow':
        documentIndex = 0;
        sheetIndex = 3;
        break;
      case '/cfollow':
        documentIndex = 0;
        sheetIndex = 3;
        break;
      case '/snr':
        documentIndex = 0;
        sheetIndex = 4;
        break;
      case '/snd':
        documentIndex = 0;
        sheetIndex = 5;
        break;
      case '/haikin':
        documentIndex = 0;
        sheetIndex = 6;
        break;
      case '/ichimoku':
        documentIndex = 0;
        sheetIndex = 7;
        break;
      default:
        break;
    }
    try {
      const stockCode = ctx.match[1].toUpperCase();
      await execFile('cscript', [__dirname + '\\modules\\ShakeMisterAmi.js', stockCode, documentIndex, sheetIndex, process.env.FILE_PATH], (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.log(`error: ${error.message}`);
          ctx.reply('GAGAL', { reply_to_message_id: ctx.message.message_id });
          return;
        }
        if (stderr) {
          ctx.reply('GAGAL', { reply_to_message_id: ctx.message.message_id });
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(process.env.FILE_PATH + stockCode + '.png');

        if (command === '/cn3y' || command === '/cfollow') {
          bot.telegram.sendPhoto('-1001565164855', { source: process.env.FILE_PATH + stockCode + '.png' },
            { caption: '#' + stockCode + ' ~ ' + moment().format('DD/MM/YYYY HH:MM:SS') });
          // { chatId: '-1001177032190' }
        } else {
          ctx.replyWithPhoto({ source: process.env.FILE_PATH + stockCode + '.png', caption: '#' + stockCode },
            { caption: '#' + stockCode + ' ~ ' + moment().format('DD/MM/YYYY HH:MM:SS') },
            { reply_to_message_id: ctx.message.message_id }
          );
        }
      });
    } catch (error) {
      console.log('error?', error);
      ctx.reply('GAGAL', { reply_to_message_id: ctx.message.message_id });
    }
  }
}
