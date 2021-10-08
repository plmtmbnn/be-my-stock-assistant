import { Request, Response } from 'express';
import { CustomerService } from '../service/CustomerService';
import * as Joi from 'joi';

export class CostumerController {
  async verify (req: Request, res: Response): Promise<void> {
    const validationSchema: any = {
      telegramId: Joi.string().required()
    };
    const validation: any = Joi.validate(req.body, validationSchema);

    if (validation.error === null) {
      const service: CustomerService = new CustomerService();
      await service.verify(req, res);
    } else {
      res.status(400).json({
        status: 'NOK',
        message: 'MISSING_DATA'
      });
    }
  }
}

export const costumerController = new CostumerController();
