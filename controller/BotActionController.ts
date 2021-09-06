import { OrderbookService, DevidenService, ValuationService, ChartService, CronService, SbService } from '../service';
import cron from 'node-cron';

export class BotActionController {
  async basicResponse (bot: any): Promise<void> {
    bot.start((ctx: any) => {
      ctx.reply(
        'Hi, ' + ctx.message.from.first_name + '.\n' + `
            [=======AVAILABLE COMMANDS=======]
            [==============CHART==============]
            /n3y [kode saham]
            /super [kode saham]
            /trend [kode saham]
            /follow [kode saham]
            /snr [kode saham]
            /snd [kode saham]
            /haikin [kode saham]
            /ichimoku [kode saham]
            [==============DATA==============]
            /simple [kode saham]
            /today [kode saham]
            /news [kode saham]
            /target_valuation [kode saham]
            /sector_valuation [kode saham]
            /stock_valuation [kode saham]
            /deviden [kode saham]
            \n
            developed with \u{2665}
            `);
    });
    bot.hears('/help', async (ctx: any) => {
      ctx.reply(
        'Hi, ' + ctx.message.from.first_name + '.\n' + `
          [=======AVAILABLE COMMANDS=======]
          [==============CHART==============]
          /n3y [kode saham] 
          /super [kode saham] 
          /trend [kode saham] 
          /follow [kode saham] 
          /snr [kode saham] 
          /snd [kode saham] 
          /haikin [kode saham] 
          /ichimoku [kode saham]
          [==============DATA==============]
          /simple [kode saham] 
          /today [kode saham] 
          /news [kode saham] 
          /target_valuation [kode saham] 
          /sector_valuation [kode saham] 
          /stock_valuation [kode saham] 
          /deviden [kode saham]
          \n
          developed with \u{2665}
          `);
    });
  }

  async cronScheduler (bot: any): Promise<void> {
    cron.schedule('16 15 * * Monday-Friday', async () => {
      await CronService.getCompositeUpdate(bot);
    });
    cron.schedule('57 8 * * Monday-Friday', async () => {
      await CronService.getTodayAgenda(bot);
    });
  }

  async hearMeAndResponseMe (bot: any): Promise<void> {
    // bot.hears('/wl', async (ctx: any) => {
    //   await StockTechnical.responseWatchlistBot(ctx);
    // });

    this.basicResponse(bot);
    this.cronScheduler(bot);

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
    });
  }
}

export const botActionController = new BotActionController();
