const express = require('express');
const router = express.Router();
const app = express();
const port = 2404;
var cron = require('node-cron');
var ping = require('ping');

const StockTechnical = require('./modules/StockTechnical');
const { Telegraf } = require('telegraf')
const BOT_TOKEN = '1796759530:AAH3fSh6LyftDrOArLPxrqKk6kd0qLqZJRo';
const bot = new Telegraf(BOT_TOKEN);

app.listen(port, () => console.log(`url-shortener listening on port ${port}!`));

router.post('/', (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "This API is to the moon.",
    })
});

app.use('/', router);

bot.start((ctx) => ctx.reply('Horas bohh ' + ctx.message.from.first_name + '\n\n' + 'Command tersedia saat ini: \n/c [kode saham] \n/simple [kode saham] \n /today [kode saham] \n /news [kode saham] \n /target_valuation [kode saham] \n /sector_valuation [kode saham] \n /stock_valuation [kode saham] \n /deviden [kode saham] \n'));
bot.help((ctx) => ctx.reply('Send me a sticker'))

bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears('/test', (ctx) => {
    ctx.reply('Command tersedia saat ini: \n/c [kode saham] \n/simple [kode saham] \n /today [kode saham] \n /news [kode saham] \n /target_valuation [kode saham] \n /sector_valuation [kode saham] \n /stock_valuation [kode saham] \n /deviden [kode saham] \n')});
bot.hears('/WhatYouSeeIsWhatYouGet', (ctx) => ctx.reply('Command tersedia saat ini: \n/c [kode saham] \n/simple [kode saham] \n /today [kode saham] \n /news [kode saham] \n /target_valuation [kode saham] \n /sector_valuation [kode saham] \n /stock_valuation [kode saham] \n /deviden [kode saham] \n'));
bot.hears('/WhatYouServeIsWhatYouDeserve', (ctx) => ctx.reply('Command tersedia saat ini: \n/c [kode saham] \n/simple [kode saham] \n /today [kode saham] \n /news [kode saham] \n /target_valuation [kode saham] \n /sector_valuation [kode saham] \n /stock_valuation [kode saham] \n /deviden [kode saham] \n'));

bot.hears('/WhatsNew', (ctx) => {
    ctx.reply('Command tersedia saat ini: \n/c [kode saham] \n/simple [kode saham] \n /today [kode saham] \n /news [kode saham] \n /target_valuation [kode saham] 🆕 \n /sector_valuation [kode saham] 🆕 \n /stock_valuation [kode saham] 🆕 \n /deviden [kode saham] 🆕 \n')
});

bot.hears('/ping', async (ctx) => {
    var hosts = ['google.com'];

for(let host of hosts){
     // WARNING: -i 2 argument may not work in other platform like windows
    let res = await ping.promise.probe(host, {
           timeout: 10,
           extra: ['-i', '2'],
       });
    console.log(res);
    ctx.reply(res.output);
}
});

bot.hears('/wl', async (ctx) => {
    await StockTechnical.responseWatchlistBot(ctx);
});

cron.schedule('16 15 * * Monday-Friday', async () => {
    await StockTechnical.responseCompositeUpdate(bot);
});

cron.schedule('40 8 * * Monday-Friday', async () => {
    await StockTechnical.responseCalenderUpdate(bot);
});

// cron.schedule('*/5 * * * * Monday-Friday', async () => {
//     bot.telegram.sendMessage('-1001565164855', "TEST");
// });

const regex = new RegExp(/[a-zA-Z] (.+)/g);
bot.context.regex = regex;
bot.hears(regex, async (ctx) => {
    let isTextMatched = false;
    if (
        ctx.match.input.includes('/snr ') ||
        ctx.match.input.includes('/momentum ') ||
        ctx.match.input.includes('/tf ') ||
        ctx.match.input.includes('/fibo ') ||
        ctx.match.input.includes('/zigzag ') ||
        ctx.match.input.includes('/darvas ') ||
        ctx.match.input.includes('/complex ') ||
        ctx.match.input.includes('/ma ') ||
        ctx.match.input.includes('/t ') ||
        ctx.match.input.includes('/percent ') ||
        ctx.match.input.includes('/selendang ')
    ) {
        isTextMatched = true;
        await StockTechnical.responseStockChart(ctx);
    }
    if (ctx.match.input.includes('/today')) {
        isTextMatched = true;
        await StockTechnical.responseOrderBookBot(ctx, true);
    }
    if (ctx.match.input.includes('/simple')) {
        isTextMatched = true;
        await StockTechnical.responseOrderBookBot(ctx);
    }
    if (ctx.match.input.includes('/target_valuation')) {
        isTextMatched = true;
        await StockTechnical.responseStockValuation(ctx);
    }
    if (ctx.match.input.includes('/sector_valuation')) {
        isTextMatched = true;
        await StockTechnical.responseStockValuationSameSector(ctx);
    }
    if (ctx.match.input.includes('/stock_valuation')) {
        isTextMatched = true;
        await StockTechnical.responseStockValuationStock(ctx);
    }
    if (ctx.match.input.includes('/news')) {
        isTextMatched = true;
        await StockTechnical.responseStockNews(ctx);
    }
    if (ctx.match.input.includes('/deviden')) {
        isTextMatched = true;
        await StockTechnical.responseStockDeviden(ctx);
    }

    if (!isTextMatched) {
        if (ctx.match.input.toLowerCase().includes('😔')) {
            ctx.reply('Jangan sedih kak, masih ada cuan di depan.', { reply_to_message_id: ctx.message.message_id });
        }

        if (ctx.match.input.toLowerCase().includes('liverpool') ||
            ctx.match.input.toLowerCase().includes('loserpool') ||
            ctx.match.input.toLowerCase().includes('lfc')) {
            ctx.reply('Liverpool masuk kata yang blacklist.', { reply_to_message_id: ctx.message.message_id });
        }
        if (ctx.match.input.toLowerCase().includes(' anjing ') ||
            ctx.match.input.toLowerCase().includes(' ajg ') ||
            ctx.match.input.toLowerCase().includes(' bangsat ') ||
            ctx.match.input.toLowerCase().includes(' bgst ') ||
            ctx.match.input.toLowerCase().includes(' bajingan ') ||
            ctx.match.input.toLowerCase().includes(' asu ') ||
            ctx.match.input.toLowerCase().includes(' kampret ') ||
            ctx.match.input.toLowerCase().includes(' taik ') ||
            ctx.match.input.toLowerCase().includes(' ajg ') ||
            ctx.match.input.toLowerCase().includes(' tai ')) {
            ctx.reply('Hmm kasar.😳', { reply_to_message_id: ctx.message.message_id });
        }
    }
});

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
