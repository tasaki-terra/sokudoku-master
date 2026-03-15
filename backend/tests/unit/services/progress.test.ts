import type { TrainingType } from '../../../src/types';

vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    trainingResult: {
      aggregate: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

import { getStats, getBestScores, getProgress } from '../../../src/services/progress';
import { prisma } from '../../../src/lib/prisma';

const mockedPrisma = vi.mocked(prisma, true);

const ALL_TRAINING_TYPES: TrainingType[] = [
  'horizontal',
  'vertical',
  'diagonal',
  'complex',
  'sequence',
  'continuous',
];

describe('getStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('データあり: earnedPoints合計=500, count=5, avg correctRate=75.5', async () => {
    mockedPrisma.trainingResult.aggregate.mockResolvedValue({
      _sum: { earnedPoints: 500 },
      _avg: { correctRate: 75.5 },
    } as never);
    mockedPrisma.trainingResult.count.mockResolvedValue(5 as never);

    const stats = await getStats();

    expect(stats.totalPoints).toBe(500);
    expect(stats.currentLevel).toBe(5);
    expect(stats.totalTrainings).toBe(5);
    expect(stats.averageCorrectRate).toBe(75.5);
  });

  it('データなし: _sum=null, _avg=null, count=0 → デフォルト値', async () => {
    mockedPrisma.trainingResult.aggregate.mockResolvedValue({
      _sum: { earnedPoints: null },
      _avg: { correctRate: null },
    } as never);
    mockedPrisma.trainingResult.count.mockResolvedValue(0 as never);

    const stats = await getStats();

    expect(stats.totalPoints).toBe(0);
    expect(stats.currentLevel).toBe(1);
    expect(stats.totalTrainings).toBe(0);
    expect(stats.averageCorrectRate).toBe(0);
  });

  it('currentLevel計算: totalPoints=50 → ceil(50/100)=1', async () => {
    mockedPrisma.trainingResult.aggregate.mockResolvedValue({
      _sum: { earnedPoints: 50 },
      _avg: { correctRate: 80 },
    } as never);
    mockedPrisma.trainingResult.count.mockResolvedValue(1 as never);

    const stats = await getStats();

    expect(stats.currentLevel).toBe(1);
  });

  it('currentLevel計算: totalPoints=101 → ceil(101/100)=2', async () => {
    mockedPrisma.trainingResult.aggregate.mockResolvedValue({
      _sum: { earnedPoints: 101 },
      _avg: { correctRate: 80 },
    } as never);
    mockedPrisma.trainingResult.count.mockResolvedValue(2 as never);

    const stats = await getStats();

    expect(stats.currentLevel).toBe(2);
  });

  it('averageCorrectRate四捨五入: 75.555 → 75.56', async () => {
    mockedPrisma.trainingResult.aggregate.mockResolvedValue({
      _sum: { earnedPoints: 100 },
      _avg: { correctRate: 75.555 },
    } as never);
    mockedPrisma.trainingResult.count.mockResolvedValue(3 as never);

    const stats = await getStats();

    expect(stats.averageCorrectRate).toBe(75.56);
  });
});

describe('getBestScores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('データあり: groupByで2タイプ返却 → 返却された型はスコアあり、それ以外は0', async () => {
    mockedPrisma.trainingResult.groupBy.mockResolvedValue([
      { type: 'horizontal', _max: { score: 95 } },
      { type: 'vertical', _max: { score: 80 } },
    ] as never);

    const bestScores = await getBestScores();

    expect(bestScores.horizontal).toBe(95);
    expect(bestScores.vertical).toBe(80);
    expect(bestScores.diagonal).toBe(0);
    expect(bestScores.complex).toBe(0);
    expect(bestScores.sequence).toBe(0);
    expect(bestScores.continuous).toBe(0);
  });

  it('データなし: 全タイプが0', async () => {
    mockedPrisma.trainingResult.groupBy.mockResolvedValue([] as never);

    const bestScores = await getBestScores();

    for (const type of ALL_TRAINING_TYPES) {
      expect(bestScores[type]).toBe(0);
    }
  });
});

describe('getProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getStatsとgetBestScoresの結果を組み合わせてUserProgress形式で返却', async () => {
    mockedPrisma.trainingResult.aggregate.mockResolvedValue({
      _sum: { earnedPoints: 300 },
      _avg: { correctRate: 85.0 },
    } as never);
    mockedPrisma.trainingResult.count.mockResolvedValue(10 as never);
    mockedPrisma.trainingResult.groupBy.mockResolvedValue([
      { type: 'horizontal', _max: { score: 100 } },
      { type: 'diagonal', _max: { score: 70 } },
    ] as never);

    const progress = await getProgress();

    expect(progress.totalPoints).toBe(300);
    expect(progress.currentLevel).toBe(3);
    expect(progress.totalTrainings).toBe(10);
    expect(progress.bestScores.horizontal).toBe(100);
    expect(progress.bestScores.diagonal).toBe(70);
    expect(progress.bestScores.vertical).toBe(0);
    expect(progress.bestScores.complex).toBe(0);
    expect(progress.bestScores.sequence).toBe(0);
    expect(progress.bestScores.continuous).toBe(0);
  });
});
