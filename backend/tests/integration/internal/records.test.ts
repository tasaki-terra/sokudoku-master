import request from 'supertest';
import { app } from '../../../src/app';
import { prisma } from '../../../src/lib/prisma';

describe('Slice 2-A: Records API', () => {
  const createdSessionIds: string[] = [];
  const createdResultIds: string[] = [];

  async function createTrainingWithResult(
    type: string,
    level: number,
    score: number,
    correctRate: number,
    earnedPoints: number
  ) {
    const startRes = await request(app)
      .post('/api/training/start')
      .send({ type, level });

    const { sessionId } = startRes.body;
    createdSessionIds.push(sessionId);

    const resultRes = await request(app)
      .post('/api/training/result')
      .send({
        sessionId,
        type,
        level,
        score,
        correctRate,
        earnedPoints,
        quizAnswers: [
          { questionIndex: 0, selectedOption: 1, correctOption: 1, isCorrect: true },
        ],
      });

    createdResultIds.push(resultRes.body.id);
    return resultRes.body;
  }

  beforeAll(async () => {
    // Clean up before tests
    await prisma.trainingResult.deleteMany({});
    await prisma.trainingSession.deleteMany({});

    // Create test data: 5 horizontal, 3 vertical
    for (let i = 0; i < 5; i++) {
      await createTrainingWithResult('horizontal', 1, 60 + i * 10, 50 + i * 10, 30 + i * 5);
    }
    for (let i = 0; i < 3; i++) {
      await createTrainingWithResult('vertical', 2, 70 + i * 5, 60 + i * 5, 40 + i * 5);
    }
  });

  afterAll(async () => {
    await prisma.trainingResult.deleteMany({});
    await prisma.trainingSession.deleteMany({});
    await prisma.$disconnect();
  });

  describe('GET /api/training/records', () => {
    it('should return records array and total with default pagination', async () => {
      const res = await request(app).get('/api/training/records');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('records');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.records)).toBe(true);
      expect(res.body.total).toBe(8);
      expect(res.body.records.length).toBeLessThanOrEqual(10); // default limit
    });

    it('should filter by type when type query param is provided', async () => {
      const res = await request(app)
        .get('/api/training/records')
        .query({ type: 'vertical' });

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(3);
      for (const record of res.body.records) {
        expect(record.type).toBe('vertical');
      }
    });

    it('should return page 2 data with correct pagination', async () => {
      const res = await request(app)
        .get('/api/training/records')
        .query({ page: 2, limit: 3 });

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(8);
      expect(res.body.records.length).toBe(3);
    });

    it('should return records in descending order by createdAt', async () => {
      const res = await request(app).get('/api/training/records');

      expect(res.status).toBe(200);
      const dates = res.body.records.map((r: { createdAt: string }) => new Date(r.createdAt).getTime());
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });
  });

  describe('GET /api/training/records/:id', () => {
    it('should return a TrainingRecord for an existing ID', async () => {
      const id = createdResultIds[0];
      const res = await request(app).get(`/api/training/records/${id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', id);
      expect(res.body).toHaveProperty('type');
      expect(res.body).toHaveProperty('level');
      expect(res.body).toHaveProperty('score');
      expect(res.body).toHaveProperty('correctRate');
      expect(res.body).toHaveProperty('earnedPoints');
      expect(res.body).toHaveProperty('quizAnswers');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should return 404 for a non-existent ID', async () => {
      const res = await request(app).get('/api/training/records/non_existent_id_12345');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Record not found');
    });
  });
});
