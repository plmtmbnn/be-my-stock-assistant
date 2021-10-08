import { Sequelize } from 'sequelize';

const databaseName: string = 'kbtpaotk';
const databaseUsername: string = 'kbtpaotk';
const databasePassword: string = '8ZovjybDGhroSpmfxr1KltiDWSrKEI7J';
const databaseHost: string = 'fanny.db.elephantsql.com';

export const sequelize = new Sequelize(
  databaseName,
  databaseUsername,
  databasePassword,
  {
    host: databaseHost,
    port: 5432,
    pool: {
      max: 20,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    logging: false,
    dialect: 'postgres',
    dialectOptions: {
      application_name: 'n3y-db'
    }
  }
);
