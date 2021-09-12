const { Sequelize } = require('sequelize');

export const sequelize = new Sequelize(
  {
    logging: false,
    dialect: 'sqlite',
    storage: process.env.SQLITE_PATH
  }
);
