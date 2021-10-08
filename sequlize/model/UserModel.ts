import { sequelize } from '../init';
import { DataTypes } from 'sequelize';

export const UserModel = sequelize.define('t_user', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  telegramId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telegramUsername: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  underscored: true,
  tableName: 't_user',
  createdAt: true,
  updatedAt: true
});
