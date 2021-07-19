import express, { Request, Response } from 'express';
import { botActionController } from './controller/BotActionController';
const router = express.Router();
const app = express();
const port = process.env.PORT_SERVICE;
const { Telegraf } = require('telegraf');
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

app.listen(port, () => console.log(`Be my stock assistant is live at PORT: ${port}!`));

router.post('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'This API is to the moon.'
  });
});

app.use('/', router);

botActionController.hearMeAndResponseMe(bot);

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
