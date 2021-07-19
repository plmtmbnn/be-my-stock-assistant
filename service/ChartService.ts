/* eslint-disable no-path-concat */
/* eslint-disable no-unsafe-finally */
const { execFile } = require('child_process');
export class ChartService {
  static async getChartImage (ctx: any): Promise<void> {
    console.log(ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
    const command = ctx.match.input.split(' ')[0];
    let documentIndex = 0; let sheetIndex = 0;
    switch (command) {
      case '/n3y':
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
      case '/trend2':
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
      await execFile('cscript', [__dirname + '\\modules\\ShakeMisterAmi.js', stockCode, documentIndex, sheetIndex], (error: any, stdout: any, stderr: any) => {
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
        ctx.replyWithPhoto({ source: 'C:\\Project\\ami-result\\' + stockCode + '.png' },
          { reply_to_message_id: ctx.message.message_id },
          { caption: '#' + stockCode });
      });
    } catch (error) {
      console.log('error?', error);
      ctx.reply('GAGAL', { reply_to_message_id: ctx.message.message_id });
    }
  }
}
