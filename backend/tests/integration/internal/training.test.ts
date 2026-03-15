import request from 'supertest';
import { app } from '../../../src/app';
import { prisma } from '../../../src/lib/prisma';

describe('Slice 1: Training API', () => {
  afterAll(async () => {
    await prisma.trainingResult.deleteMany({});
    await prisma.trainingSession.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/training/start', () => {
    it('should return 200 with sessionId, grid, displayOrder, intervalMs, gridSize for valid request', async () => {
      const res = await request(app)
        .post('/api/training/start')
        .send({ type: 'horizontal', level: 1 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('sessionId');
      expect(res.body).toHaveProperty('grid');
      expect(res.body).toHaveProperty('displayOrder');
      expect(res.body).toHaveProperty('intervalMs');
      expect(res.body).toHaveProperty('gridSize');
      expect(typeof res.body.sessionId).toBe('string');
      expect(typeof res.body.intervalMs).toBe('number');
      expect(typeof res.body.gridSize).toBe('number');
    });

    it('should return grid with cell count = gridSize * gridSize', async () => {
      const res = await request(app)
        .post('/api/training/start')
        .send({ type: 'vertical', level: 1 });

      expect(res.status).toBe(200);
      const { grid, gridSize } = res.body;
      expect(grid).toHaveLength(gridSize * gridSize);
    });

    it('should return displayOrder with length = gridSize * gridSize', async () => {
      const res = await request(app)
        .post('/api/training/start')
        .send({ type: 'diagonal', level: 3 });

      expect(res.status).toBe(200);
      const { displayOrder, gridSize } = res.body;
      expect(displayOrder).toHaveLength(gridSize * gridSize);
    });

    it('should return 400 for invalid type', async () => {
      const res = await request(app)
        .post('/api/training/start')
        .send({ type: 'invalid_type', level: 1 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 when body is empty', async () => {
      const res = await request(app)
        .post('/api/training/start')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /api/training/result', () => {
    it('should save result and return TrainingRecord for valid sessionId', async () => {
      // First create a session
      const startRes = await request(app)
        .post('/api/training/start')
        .send({ type: 'horizontal', level: 1 });

      const { sessionId } = startRes.body;

      const resultPayload = {
        sessionId,
        type: 'horizontal',
        level: 1,
        score: 80,
        correctRate: 75.5,
        earnedPoints: 50,
        quizAnswers: [
          { questionIndex: 0, selectedOption: 1, correctOption: 1, isCorrect: true },
          { questionIndex: 1, selectedOption: 2, correctOption: 3, isCorrect: false },
        ],
      };

      const res = await request(app)
        .post('/api/training/result')
        .send(resultPayload);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.type).toBe('horizontal');
      expect(res.body.level).toBe(1);
      expect(res.body.score).toBe(80);
      expect(res.body.correctRate).toBe(75.5);
      expect(res.body.earnedPoints).toBe(50);
      expect(res.body.quizAnswers).toHaveLength(2);
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should return 500 for non-existent sessionId', async () => {
      const resultPayload = {
        sessionId: 'non_existent_session_id',
        type: 'horizontal',
        level: 1,
        score: 80,
        correctRate: 75.5,
        earnedPoints: 50,
        quizAnswers: [],
      };

      const res = await request(app)
        .post('/api/training/result')
        .send(resultPayload);

      expect(res.status).toBe(500);
    });

    it('should return 400 for validation error (missing required fields)', async () => {
      const res = await request(app)
        .post('/api/training/result')
        .send({ sessionId: 'abc' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
    });
  });
});
