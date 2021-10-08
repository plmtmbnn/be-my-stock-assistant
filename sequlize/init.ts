import { Sequelize } from 'sequelize';

// ELEPHANTSQL
// const databaseName: string = 'kbtpaotk';
// const databaseUsername: string = 'kbtpaotk';
// const databasePassword: string = '8ZovjybDGhroSpmfxr1KltiDWSrKEI7J';
// const databaseHost: string = 'fanny.db.elephantsql.com';

// CLEVER CLOUD
const databaseName: string = 'b6qhg5jk1pzzoojpaxh8';
const databaseUsername: string = 'uviezjmohzujto45lumo';
const databasePassword: string = '4oWsERkytCpqTvNBVf1y';
const databaseHost: string = 'b6qhg5jk1pzzoojpaxh8-postgresql.services.clever-cloud.com';

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
