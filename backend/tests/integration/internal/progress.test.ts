import request from 'supertest';
import { app } from '../../../src/app';
import { prisma } from '../../../src/lib/prisma';

describe('Slice 2-B: Progress API', () => {
  beforeAll(async () => {
    // Clean up before tests
    await prisma.trainingResult.deleteMany({});
    await prisma.trainingSession.deleteMany({});

    // Create test data:
    // horizontal: score 80, correctRate 70, earnedPoints 50
    // horizontal: score 90, correctRate 80, earnedPoints 60
    // vertical:   score 70, correctRate 60, earnedPoints 40
    const testData = [
      { type: 'horizontal', level: 1, score: 80, correctRate: 70, earnedPoints: 50 },
      { type: 'horizontal', level: 1, score: 90, correctRate: 80, earnedPoints: 60 },
      { type: 'vertical', level: 2, score: 70, correctRate: 60, earnedPoints: 40 },
    ];

    for (const d of testData) {
      const startRes = await request(app)
        .post('/api/training/start')
        .send({ type: d.type, level: d.level });

      await request(app)
        .post('/api/training/result')
        .send({
          sessionId: startRes.body.sessionId,
          type: d.type,
          level: d.level,
          score: d.score,
          correctRate: d.correctRate,
          earnedPoints: d.earnedPoints,
          quizAnswers: [
            { questionIndex: 0, selectedOption: 1, correctOption: 1, isCorrect: true },
          ],
        });
    }
  });

  afterAll(async () => {
    await prisma.trainingResult.deleteMany({});
    await prisma.trainingSession.deleteMany({});
    await prisma.$disconnect();
  });

  describe('GET /api/records/stats', () => {
    it('should return totalTrainings, currentLevel, totalPoints, averageCorrectRate', async () => {
      const res = await request(app).get('/api/records/stats');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalTrainings');
      expect(res.body).toHaveProperty('currentLevel');
      expect(res.body).toHaveProperty('totalPoints');
      expect(res.body).toHaveProperty('averageCorrectRate');
    });

    it('should return correct computed values', async () => {
      const res = await request(app).get('/api/records/stats');

      expect(res.status).toBe(200);
      // totalTrainings = 3
      expect(res.body.totalTrainings).toBe(3);
      // totalPoints = 50 + 60 + 40 = 150
      expect(res.body.totalPoints).toBe(150);
      // currentLevel = ceil(150 / 100) = 2
      expect(res.body.currentLevel).toBe(2);
      // averageCorrectRate = (70 + 80 + 60) / 3 = 70.0
      expect(res.body.averageCorrectRate).toBe(70);
    });
  });

  describe('GET /api/progress', () => {
    it('should return UserProgress format with totalPoints, currentLevel, totalTrainings, bestScores', async () => {
      const res = await request(app).get('/api/progress');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalPoints');
      expect(res.body).toHaveProperty('currentLevel');
      expect(res.body).toHaveProperty('totalTrainings');
      expect(res.body).toHaveProperty('bestScores');
      expect(typeof res.body.bestScores).toBe('object');
    });
  });

  describe('GET /api/progress/best-scores', () => {
    it('should return best score per TrainingType', async () => {
      const res = await request(app).get('/api/progress/best-scores');

      expect(res.status).toBe(200);
      // horizontal best: 90
      expect(res.body.horizontal).toBe(90);
      // vertical best: 70
      expect(res.body.vertical).toBe(70);
    });

    it('should return 0 for types with no records', async () => {
      const res = await request(app).get('/api/progress/best-scores');

      expect(res.status).toBe(200);
      expect(res.body.diagonal).toBe(0);
      expect(res.body.complex).toBe(0);
      expect(res.body.sequence).toBe(0);
      expect(res.body.continuous).toBe(0);
    });
  });
});
