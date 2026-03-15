import { Router, Request, Response } from 'express';
import { startTrainingSchema, saveTrainingResultSchema } from '../schemas/training';
import { recordsListQuerySchema } from '../schemas/records';
import * as trainingService from '../services/training';
import * as recordsService from '../services/records';

export const trainingRouter = Router();

trainingRouter.post('/start', async (req: Request, res: Response) => {
  const parsed = startTrainingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    return;
  }

  const result = await trainingService.startTraining(parsed.data);
  res.json(result);
});

trainingRouter.post('/result', async (req: Request, res: Response) => {
  const parsed = saveTrainingResultSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    return;
  }

  const record = await trainingService.saveResult(parsed.data);
  res.json(record);
});

trainingRouter.get('/records', async (req: Request, res: Response) => {
  const parsed = recordsListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    return;
  }

  const result = await recordsService.getRecords(parsed.data);
  res.json(result);
});

trainingRouter.get('/records/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid id parameter' });
    return;
  }

  const record = await recordsService.getRecordById(id);
  if (!record) {
    res.status(404).json({ error: 'Record not found' });
    return;
  }

  res.json(record);
});
