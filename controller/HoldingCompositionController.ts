import { Request, Response } from 'express';
import { HoldingCompositionService } from '../service/HoldingCompositionService';

export class HoldingCompositionController {
  async writeHoldingComposition (req: Request, res: Response): Promise<void> {
    const holdingCompositionService: HoldingCompositionService = new HoldingCompositionService(req, res);
    await holdingCompositionService.writeData(req, res);
  }
}

export const holdingCompositionController = new HoldingCompositionController();
