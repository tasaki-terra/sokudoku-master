import type { TrainingType } from '../../../src/types';

vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    trainingResult: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { getRecords, getRecordById } from '../../../src/services/records';
import { prisma } from '../../../src/lib/prisma';

const mockedPrisma = vi.mocked(prisma, true);

const makePrismaResult = (overrides: Partial<{
  id: string;
  type: string;
  level: number;
  score: number;
  correctRate: number;
  earnedPoints: number;
  quizAnswers: unknown;
  createdAt: Date;
}> = {}) => ({
  id: 'rec-001',
  type: 'horizontal',
  level: 3,
  score: 85,
  correctRate: 90.5,
  earnedPoints: 100,
  quizAnswers: [{ questionIndex: 0, selectedOption: 2, correctOption: 2, isCorrect: true }],
  createdAt: new Date('2026-03-15T10:00:00.000Z'),
  ...overrides,
});

describe('getRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('typeフィルタなし → whereが空オブジェクト', async () => {
    mockedPrisma.trainingResult.findMany.mockResolvedValue([] as never);
    mockedPrisma.trainingResult.count.mockResolvedValue(0 as never);

    await getRecords({ page: 1, limit: 10 });

    expect(mockedPrisma.trainingResult.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
    expect(mockedPrisma.trainingResult.count).toHaveBeenCalledWith({ where: {} });
  });

  it('typeフィルタあり → whereにtype指定', async () => {
    mockedPrisma.trainingResult.findMany.mockResolvedValue([] as never);
    mockedPrisma.trainingResult.count.mockResolvedValue(0 as never);

    await getRecords({ type: 'vertical' as TrainingType, page: 1, limit: 10 });

    expect(mockedPrisma.trainingResult.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { type: 'vertical' } })
    );
    expect(mockedPrisma.trainingResult.count).toHaveBeenCalledWith({
      where: { type: 'vertical' },
    });
  });

  it('ページネーション計算: page=2, limit=10 → skip=10', async () => {
    mockedPrisma.trainingResult.findMany.mockResolvedValue([] as never);
    mockedPrisma.trainingResult.count.mockResolvedValue(0 as never);

    await getRecords({ page: 2, limit: 10 });

    expect(mockedPrisma.trainingResult.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('結果をTrainingRecord形式に変換（createdAtがISO文字列化、typeがTrainingType）', async () => {
    const prismaResult = makePrismaResult();
    mockedPrisma.trainingResult.findMany.mockResolvedValue([prismaResult] as never);
    mockedPrisma.trainingResult.count.mockResolvedValue(1 as never);

    const response = await getRecords({ page: 1, limit: 10 });

    expect(response.records).toHaveLength(1);
    const record = response.records[0];
    expect(record.id).toBe('rec-001');
    expect(record.type).toBe('horizontal');
    expect(record.createdAt).toBe('2026-03-15T10:00:00.000Z');
    expect(typeof record.createdAt).toBe('string');
    expect(record.level).toBe(3);
    expect(record.score).toBe(85);
    expect(record.correctRate).toBe(90.5);
    expect(record.earnedPoints).toBe(100);
    expect(record.quizAnswers).toEqual([
      { questionIndex: 0, selectedOption: 2, correctOption: 2, isCorrect: true },
    ]);
  });

  it('total件数が正しく返却', async () => {
    mockedPrisma.trainingResult.findMany.mockResolvedValue([] as never);
    mockedPrisma.trainingResult.count.mockResolvedValue(42 as never);

    const response = await getRecords({ page: 1, limit: 10 });

    expect(response.total).toBe(42);
  });
});

describe('getRecordById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('存在するID → TrainingRecord返却', async () => {
    const prismaResult = makePrismaResult({ id: 'rec-exist' });
    mockedPrisma.trainingResult.findUnique.mockResolvedValue(prismaResult as never);

    const result = await getRecordById('rec-exist');

    expect(result).not.toBeNull();
    expect(result!.id).toBe('rec-exist');
    expect(result!.type).toBe('horizontal');
    expect(result!.createdAt).toBe('2026-03-15T10:00:00.000Z');
    expect(mockedPrisma.trainingResult.findUnique).toHaveBeenCalledWith({
      where: { id: 'rec-exist' },
    });
  });

  it('存在しないID → null返却', async () => {
    mockedPrisma.trainingResult.findUnique.mockResolvedValue(null as never);

    const result = await getRecordById('non-existent');

    expect(result).toBeNull();
  });
});
