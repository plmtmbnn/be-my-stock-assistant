import { Request, Response } from 'express';

export class BaseService {
    req: Request;
    res: Response;
    constructor (req: Request, res: Response) {
      this.req = req;
      this.res = res;
    }
}
