import {
  OrderbookService, DevidenService, ValuationService, ChartService, CronService, SbService,
  AlertService, CustomerService
} from '../service';
import cron from 'node-cron';
import moment from 'moment';
import { WatchlistService } from '../service/WatchlistService';

import RedisController from '../redis/redis';

export class BotActionController {
  async basicResponse (bot: any): Promise<void> {
    bot.start((ctx: any) => {
      ctx.reply(
        'Hi, ' + ctx.message.from.first_name + '.\n\n' +
        '[=======AVAILABLE COMMANDS=======]\n' +
        '[==============CHART==============]\n' +
        '/n3y [kode saham]\n' +
        '/super [kode saham]\n' +
        '/trend [kode saham]\n' +
        '/follow [kode saham]\n' +
        '/snr [kode saham]\n' +
        '/snd [kode saham]\n' +
        '/haikin [kode saham]\n' +
        '/ichimoku [kode saham]\n\n' +
        '[==============DATA==============]\n' +
        '/sr [kode saham]\n' +
        '/supportresist [kode saham]\n' +
        '/simple [kode saham]\n' +
        '/today [kode saham]\n' +
        '/news [kode saham]\n' +
        '/target_valuation [kode saham]\n' +
        '/sector_valuation [kode saham]\n' +
        '/stock_valuation [kode saham]\n' +
        '/deviden [kode saham]\n\n' +
        '[===============WL===============]\n' +
        '/my_wl\n' +
        '/clear_wl\n' +
        '/add_my_wl [kode saham]\n\n' +
        '/join_general_wl\n' +
        '/stop_general_wl\n\n' +
        'e.g: /supportresist BBCA\n\n' +
        'developed with \u{2665}');
    });
    bot.hears('/help', async (ctx: any) => {
      ctx.reply(
        'Hi, ' + ctx.message.from.first_name + '.\n\n' +
        '[=======AVAILABLE COMMANDS=======]\n' +
        '[==============CHART==============]\n' +
        '/n3y [kode saham]\n' +
        '/super [kode saham]\n' +
        '/trend [kode saham]\n' +
        '/follow [kode saham]\n' +
        '/snr [kode saham]\n' +
        '/snd [kode saham]\n' +
        '/haikin [kode saham]\n' +
        '/ichimoku [kode saham]\n\n' +
        '[==============DATA==============]\n' +
        '/sr [kode saham]\n' +
        '/supportresist [kode saham]\n' +
        '/simple [kode saham]\n' +
        '/today [kode saham]\n' +
        '/news [kode saham]\n' +
        '/target_valuation [kode saham]\n' +
        '/sector_valuation [kode saham]\n' +
        '/stock_valuation [kode saham]\n' +
        '/deviden [kode saham]\n\n' +
        '[===============WL===============]\n' +
        '/my_wl\n' +
        '/clear_wl\n' +
        '/add_my_wl [kode saham]\n\n' +
        '/join_general_wl\n' +
        '/stop_general_wl\n\n' +
        'e.g: /supportresist BBCA\n\n' +
        'developed with \u{2665}');
    });
  }

  async cronScheduler (bot: any): Promise<void> {
    cron.schedule('16 15 * * Monday-Friday', async () => {
      await CronService.getCompositeUpdate(bot);
    });
    cron.schedule('40 8 * * Monday-Friday', async () => {
      await CronService.getTodayAgenda(bot);
      await CustomerService.checkAndUpdateConsumerFacility();
    });
    cron.schedule('*/10 9,10,11,13,14 * * Monday-Friday', async () => {
      if (moment(new Date(), 'HH:mm:ss') <= moment('11:30', 'HH:mm:ss') ||
      moment(new Date(), 'HH:mm:ss') >= moment('13:30', 'HH:mm:ss')) {
        await AlertService.notifyWhenPriceOnSupportOrResistance(bot);
        await AlertService.notifySingleUserWatchlistWhenPriceOnSupportOrResistance(bot);
      }
    });
  }

  async hearMeAndResponseMe (bot: any): Promise<void> {
    this.basicResponse(bot);
    this.cronScheduler(bot);

    bot.hears('/daftar', async (ctx: any) => {
      await CustomerService.registerNewUser(ctx);
    });

    bot.hears('/stop_custs', async (ctx: any) => {
      const redis: RedisController = new RedisController();
      await redis.removeValue('activeUsers');
      ctx.reply('OK');
    });

    bot.hears('/active_custs', async (ctx: any) => {
      await CustomerService.checkAndUpdateConsumerFacility();
      ctx.reply('OK');
    });

    bot.hears('/custs', async (ctx: any) => {
      await CustomerService.getAllCustomerCommands(ctx);
    });

    bot.hears('/stop_general_wl', async (ctx: any) => {
      await WatchlistService.updateMeFromGeneralWatchlistCommand(ctx, false);
    });

    bot.hears('/join_general_wl', async (ctx: any) => {
      await WatchlistService.updateMeFromGeneralWatchlistCommand(ctx, true);
    });

    bot.hears('/wl', async (ctx: any) => {
      await WatchlistService.getWatchlistCommand(ctx);
    });

    bot.hears('/my_wl', async (ctx: any) => {
      await WatchlistService.getMyWatchlistCommand(ctx);
    });

    bot.hears('/clear_wl', async (ctx: any) => {
      await WatchlistService.deleteWatchlistCommand(ctx);
    });

    bot.hears('/clear_my_wl', async (ctx: any) => {
      await WatchlistService.deleteMyWatchlistCommand(ctx);
    });

    const regex = new RegExp(/[a-zA-Z] (.+)/g);
    bot.context.regex = regex;
    bot.hears(regex, async (ctx: any) => {
      if (
        ctx.match.input.includes('/cn3y ') ||
        ctx.match.input.includes('/cfollow ') ||
        ctx.match.input.includes('/n3y ') ||
        ctx.match.input.includes('/super ') ||
        ctx.match.input.includes('/trend ') ||
        ctx.match.input.includes('/follow ') ||
        ctx.match.input.includes('/snr ') ||
        ctx.match.input.includes('/snd ') ||
        ctx.match.input.includes('/haikin ') ||
        ctx.match.input.includes('/ichimoku ')
      ) {
        await ChartService.getChartImage(ctx, bot);
      }
      if (ctx.match.input.includes('/today')) {
        await OrderbookService.getOrderbook(ctx, true);
      }
      if (ctx.match.input.includes('/supportresist')) {
        await OrderbookService.getSupportResistance(ctx);
      }
      if (ctx.match.input.includes('/sr')) {
        await OrderbookService.getSupportResistance(ctx);
      }
      if (ctx.match.input.includes('/simple')) {
        await OrderbookService.getOrderbook(ctx);
      }
      if (ctx.match.input.includes('/sector_valuation')) {
        await ValuationService.getStockValuation(ctx);
      }
      if (ctx.match.input.includes('/stock_valuation')) {
        await ValuationService.getStockValuation(ctx, true);
      }
      if (ctx.match.input.includes('/deviden')) {
        await DevidenService.getDevidendData(ctx);
      }
      if (ctx.match.input.includes('/post_sb')) {
        await SbService.writePost(ctx);
      }
      if (ctx.match.input.includes('/add_wl')) {
        await WatchlistService.upsertWatchlistCommand(ctx);
      }
      if (ctx.match.input.includes('/add_my_wl')) {
        await WatchlistService.upsertMyWatchlistCommand(ctx);
      }
    });
  }
}

export const botActionController = new BotActionController();
