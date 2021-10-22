import express, { Request, Response } from 'express';
import { botActionController } from './controller/BotActionController';
import { TelegramConnection } from './connection/telegram.connection';
import { sequelize } from './sequlize/init';
import { MongoDbConnection } from './mongodb/mongodb';

const router = require('./route/Router');
class App {
  app: any;

  constructor () {
    this.app = express().disable('x-powered-by');
    this.config();
  }

  async config (): Promise<void> {
    this.app.use(express.json({ limit: '100mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '100mb' }));
    this.app.use('/', router);
    const telegramConnection = new TelegramConnection();
    await telegramConnection.init();
    await botActionController.hearMeAndResponseMe(await telegramConnection.getAccess());
    await this.initializePostgrest();
    // const mongodb: MongoDbConnection = new MongoDbConnection();
    // await mongodb.init();
  }

  async initializePostgrest (): Promise<void> {
    try {
      sequelize.authenticate();
      console.log('Postgresql is connected.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  }
}

export default new App().app;
