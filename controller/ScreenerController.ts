import { Request, Response } from 'express';
import { ScreenerService } from '../service/ScreenerService';

export class ScreenerController {
  async n3yScreener (req: Request, res: Response): Promise<void> {
    const screenerService: ScreenerService = new ScreenerService(req, res);
    await screenerService.n3yScreener(req, res);
  }
}

export const screenerController = new ScreenerController();
