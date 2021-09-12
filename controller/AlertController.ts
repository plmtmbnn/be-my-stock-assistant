import { Request, Response } from 'express';
import { AlertService } from '../service/AlertService';

export class AlertController {
  async n3yScreener (req: Request, res: Response): Promise<void> {
    const alertService: AlertService = new AlertService(req, res);
    await alertService.n3yScreener(req, res);
  }
}

export const alertController = new AlertController();
