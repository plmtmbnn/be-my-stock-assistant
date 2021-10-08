import { UserModel } from '../model/index';
require('../model/associations/index');

class UserQuery {
  async findAll (where: any = {}, attributes: any = [], transaction?: any) {
    const options: any = ({
      where,
      transaction,
      order: [
        ['id', 'ASC']
      ]
    });

    if (attributes.length !== 0) { options.attributes = attributes; }
    return await UserModel.findAll(options);
  }

  async findAndCountAll (where: any = {}, attributes: any = [], transaction?: any) {
    const options: any = ({
      where,
      transaction,
      order: [
        ['id', 'ASC']
      ]
    });

    if (attributes.length !== 0) { options.attributes = attributes; }
    return await UserModel.findAndCountAll(options);
  }

  async insert (value: any, transaction?: any) {
    const options: any = ({ ...value, transaction });

    return await UserModel.create(options);
  }

  async update (value: any, where: any, transaction?: any) {
    const options: any = ({ where, transaction });

    return await UserModel.update(value, options);
  }
}

export const userQuery = new UserQuery();
