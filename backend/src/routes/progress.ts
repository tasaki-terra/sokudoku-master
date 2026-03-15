import { Router, Request, Response } from 'express';
import * as progressService from '../services/progress';

export const progressRouter = Router();

progressRouter.get('/', async (_req: Request, res: Response) => {
  const progress = await progressService.getProgress();
  res.json(progress);
});

progressRouter.get('/best-scores', async (_req: Request, res: Response) => {
  const bestScores = await progressService.getBestScores();
  res.json(bestScores);
});
