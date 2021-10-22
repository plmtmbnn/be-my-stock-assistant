/* eslint-disable no-unreachable */
/* eslint-disable prefer-const */
const { Telegraf } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;
var bot: any;

export class TelegramConnection {
  async init (): Promise<void> {
    console.log('Telegram bot is connected.');

    bot = new Telegraf(BOT_TOKEN);
    bot.launch();

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  }

  async getAccess (): Promise<boolean> {
    try {
      return bot;
    } catch (error) {
      console.log('[TelegramConnection][getAccess]', error);
      return false;
    }
  }
}
