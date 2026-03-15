import { Router, Request, Response } from 'express';
import * as progressService from '../services/progress';

export const recordsRouter = Router();

recordsRouter.get('/stats', async (_req: Request, res: Response) => {
  const stats = await progressService.getStats();
  res.json(stats);
});
