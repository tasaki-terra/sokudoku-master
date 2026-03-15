import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { trainingRouter } from './routes/training';
import { recordsRouter } from './routes/records';
import { progressRouter } from './routes/progress';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/training', trainingRouter);
app.use('/api/records', recordsRouter);
app.use('/api/progress', progressRouter);

export { app };
