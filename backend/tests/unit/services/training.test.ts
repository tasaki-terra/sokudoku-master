import type { TrainingType, GridCell } from '../../../src/types';

vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    trainingSession: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    trainingResult: {
      create: vi.fn(),
    },
  },
}));

import { startTraining, saveResult } from '../../../src/services/training';
import { prisma } from '../../../src/lib/prisma';

const mockedPrisma = vi.mocked(prisma, true);

describe('startTraining', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPrisma.trainingSession.create.mockResolvedValue({
      id: 'test-session-id',
      type: 'horizontal',
      level: 1,
      gridSize: 4,
      intervalMs: 2000,
      grid: [],
      displayOrder: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
  });

  describe('getGridSize（間接テスト）', () => {
    it.each([
      { level: 1, expectedGridSize: 4 },
      { level: 2, expectedGridSize: 4 },
    ])('level=$level → gridSize=$expectedGridSize', async ({ level, expectedGridSize }) => {
      const result = await startTraining({ type: 'horizontal', level });
      expect(result.gridSize).toBe(expectedGridSize);
      expect(result.grid).toHaveLength(expectedGridSize * expectedGridSize);
    });

    it.each([
      { level: 3, expectedGridSize: 5 },
      { level: 4, expectedGridSize: 5 },
    ])('level=$level → gridSize=$expectedGridSize', async ({ level, expectedGridSize }) => {
      const result = await startTraining({ type: 'horizontal', level });
      expect(result.gridSize).toBe(expectedGridSize);
      expect(result.grid).toHaveLength(expectedGridSize * expectedGridSize);
    });

    it.each([
      { level: 5, expectedGridSize: 6 },
      { level: 6, expectedGridSize: 6 },
    ])('level=$level → gridSize=$expectedGridSize', async ({ level, expectedGridSize }) => {
      const result = await startTraining({ type: 'horizontal', level });
      expect(result.gridSize).toBe(expectedGridSize);
      expect(result.grid).toHaveLength(expectedGridSize * expectedGridSize);
    });
  });

  describe('getIntervalMs（間接テスト）', () => {
    it('level=1 → intervalMs=2000', async () => {
      const result = await startTraining({ type: 'horizontal', level: 1 });
      expect(result.intervalMs).toBe(2000);
    });

    it('level=2 → intervalMs=1000', async () => {
      const result = await startTraining({ type: 'horizontal', level: 2 });
      expect(result.intervalMs).toBe(1000);
    });

    it('level=3 → intervalMs=500', async () => {
      const result = await startTraining({ type: 'horizontal', level: 3 });
      expect(result.intervalMs).toBe(500);
    });

    it('level=4 → intervalMs=250', async () => {
      const result = await startTraining({ type: 'horizontal', level: 4 });
      expect(result.intervalMs).toBe(250);
    });

    it('level=5 → intervalMs=100', async () => {
      const result = await startTraining({ type: 'horizontal', level: 5 });
      expect(result.intervalMs).toBe(100);
    });

    it('level=6 → intervalMs=50', async () => {
      const result = await startTraining({ type: 'horizontal', level: 6 });
      expect(result.intervalMs).toBe(50);
    });
  });

  describe('generateGrid（間接テスト）', () => {
    it('totalCells = gridSize * gridSize', async () => {
      const result = await startTraining({ type: 'horizontal', level: 1 });
      const gridSize = result.gridSize;
      expect(result.grid).toHaveLength(gridSize * gridSize);
    });

    it('特殊記号の数 = gridSize - 1', async () => {
      const result = await startTraining({ type: 'horizontal', level: 3 });
      const gridSize = result.gridSize;
      const specialCells = result.grid.filter((cell: GridCell) => cell.isSpecial);
      expect(specialCells).toHaveLength(gridSize - 1);
    });

    it('全セルにid, symbol, color, isSpecial, row, colがある', async () => {
      const result = await startTraining({ type: 'horizontal', level: 1 });
      for (const cell of result.grid) {
        expect(cell).toHaveProperty('id');
        expect(cell).toHaveProperty('symbol');
        expect(cell).toHaveProperty('color');
        expect(cell).toHaveProperty('isSpecial');
        expect(cell).toHaveProperty('row');
        expect(cell).toHaveProperty('col');
      }
    });

    it('通常セルのsymbol="○", color="#666"', async () => {
      const result = await startTraining({ type: 'horizontal', level: 1 });
      const normalCells = result.grid.filter((cell: GridCell) => !cell.isSpecial);
      for (const cell of normalCells) {
        expect(cell.symbol).toBe('○');
        expect(cell.color).toBe('#666');
      }
    });

    it('特殊セルのsymbolが有効な特殊記号、colorが有効な特殊色', async () => {
      const validSymbols = ['★', '♦', '♥', '♣'];
      const validColors = ['#FF4444', '#4444FF', '#44AA44'];

      const result = await startTraining({ type: 'horizontal', level: 5 });
      const specialCells = result.grid.filter((cell: GridCell) => cell.isSpecial);
      expect(specialCells.length).toBeGreaterThan(0);

      for (const cell of specialCells) {
        expect(validSymbols).toContain(cell.symbol);
        expect(validColors).toContain(cell.color);
      }
    });

    it('セルのrow/colが正しい範囲内', async () => {
      const result = await startTraining({ type: 'horizontal', level: 1 });
      const gridSize = result.gridSize;
      for (const cell of result.grid) {
        expect(cell.row).toBeGreaterThanOrEqual(0);
        expect(cell.row).toBeLessThan(gridSize);
        expect(cell.col).toBeGreaterThanOrEqual(0);
        expect(cell.col).toBeLessThan(gridSize);
      }
    });
  });

  describe('generateDisplayOrder（間接テスト）', () => {
    it('horizontal: 0,1,2,...の自然順', async () => {
      const result = await startTraining({ type: 'horizontal', level: 1 });
      const total = result.gridSize * result.gridSize;
      const expected = Array.from({ length: total }, (_, i) => i);
      expect(result.displayOrder).toEqual(expected);
    });

    it('continuous: horizontal同様の自然順', async () => {
      const result = await startTraining({ type: 'continuous', level: 1 });
      const total = result.gridSize * result.gridSize;
      const expected = Array.from({ length: total }, (_, i) => i);
      expect(result.displayOrder).toEqual(expected);
    });

    it('vertical: 列優先順', async () => {
      const result = await startTraining({ type: 'vertical', level: 1 });
      const gridSize = result.gridSize;
      const total = gridSize * gridSize;

      // Column-first order: col0-row0, col0-row1, ..., col1-row0, ...
      const expected = Array.from({ length: total }, (_, i) => {
        const col = Math.floor(i / gridSize);
        const row = i % gridSize;
        return row * gridSize + col;
      });
      expect(result.displayOrder).toEqual(expected);
    });

    it('sequence: 全セルIDが含まれている（順序はランダム）', async () => {
      const result = await startTraining({ type: 'sequence', level: 1 });
      const total = result.gridSize * result.gridSize;
      const allIds = Array.from({ length: total }, (_, i) => i);

      expect(result.displayOrder).toHaveLength(total);
      expect([...result.displayOrder].sort((a, b) => a - b)).toEqual(allIds);
    });

    it('diagonal: 長さ=gridSize*gridSize、重複なし', async () => {
      const result = await startTraining({ type: 'diagonal', level: 3 });
      const total = result.gridSize * result.gridSize;

      expect(result.displayOrder).toHaveLength(total);
      expect(new Set(result.displayOrder).size).toBe(total);
    });

    it('complex: 長さ=gridSize*gridSize、重複なし', async () => {
      const result = await startTraining({ type: 'complex', level: 3 });
      const total = result.gridSize * result.gridSize;

      expect(result.displayOrder).toHaveLength(total);
      expect(new Set(result.displayOrder).size).toBe(total);
    });

    it.each<TrainingType>([
      'horizontal',
      'vertical',
      'diagonal',
      'complex',
      'sequence',
      'continuous',
    ])('type="%s": 長さ=gridSize*gridSize、重複なし', async (type) => {
      const result = await startTraining({ type, level: 2 });
      const total = result.gridSize * result.gridSize;

      expect(result.displayOrder).toHaveLength(total);
      expect(new Set(result.displayOrder).size).toBe(total);
    });
  });

  it('Prisma createが正しいデータで呼ばれる', async () => {
    await startTraining({ type: 'vertical', level: 3 });

    expect(mockedPrisma.trainingSession.create).toHaveBeenCalledOnce();
    const callArg = mockedPrisma.trainingSession.create.mock.calls[0][0];
    expect(callArg.data.type).toBe('vertical');
    expect(callArg.data.level).toBe(3);
    expect(callArg.data.gridSize).toBe(5);
    expect(callArg.data.intervalMs).toBe(500);
  });

  it('sessionIdがPrismaの返却値と一致する', async () => {
    const result = await startTraining({ type: 'horizontal', level: 1 });
    expect(result.sessionId).toBe('test-session-id');
  });
});

describe('saveResult', () => {
  const validSaveData = {
    sessionId: 'existing-session',
    type: 'horizontal' as TrainingType,
    level: 3,
    score: 85,
    correctRate: 90.5,
    earnedPoints: 100,
    quizAnswers: [
      {
        questionIndex: 0,
        selectedOption: 2,
        correctOption: 2,
        isCorrect: true,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常: セッション存在→保存成功→TrainingRecord返却', async () => {
    const now = new Date();
    mockedPrisma.trainingSession.findUnique.mockResolvedValue({
      id: 'existing-session',
      type: 'horizontal',
      level: 3,
      gridSize: 5,
      intervalMs: 500,
      grid: [],
      displayOrder: [],
      createdAt: now,
      updatedAt: now,
    } as never);

    mockedPrisma.trainingResult.create.mockResolvedValue({
      id: 'result-001',
      sessionId: 'existing-session',
      type: 'horizontal',
      level: 3,
      score: 85,
      correctRate: 90.5,
      earnedPoints: 100,
      quizAnswers: validSaveData.quizAnswers,
      createdAt: now,
    } as never);

    const result = await saveResult(validSaveData);

    expect(result.id).toBe('result-001');
    expect(result.type).toBe('horizontal');
    expect(result.level).toBe(3);
    expect(result.score).toBe(85);
    expect(result.correctRate).toBe(90.5);
    expect(result.earnedPoints).toBe(100);
    expect(result.quizAnswers).toEqual(validSaveData.quizAnswers);
    expect(result.createdAt).toBe(now.toISOString());
  });

  it('正常: Prisma findUniqueとcreateが正しい引数で呼ばれる', async () => {
    const now = new Date();
    mockedPrisma.trainingSession.findUnique.mockResolvedValue({
      id: 'existing-session',
    } as never);
    mockedPrisma.trainingResult.create.mockResolvedValue({
      id: 'result-001',
      sessionId: 'existing-session',
      type: 'horizontal',
      level: 3,
      score: 85,
      correctRate: 90.5,
      earnedPoints: 100,
      quizAnswers: validSaveData.quizAnswers,
      createdAt: now,
    } as never);

    await saveResult(validSaveData);

    expect(mockedPrisma.trainingSession.findUnique).toHaveBeenCalledWith({
      where: { id: 'existing-session' },
    });
    expect(mockedPrisma.trainingResult.create).toHaveBeenCalledWith({
      data: {
        sessionId: 'existing-session',
        type: 'horizontal',
        level: 3,
        score: 85,
        correctRate: 90.5,
        earnedPoints: 100,
        quizAnswers: JSON.parse(JSON.stringify(validSaveData.quizAnswers)),
      },
    });
  });

  it('異常: セッション不存在→Error throw', async () => {
    mockedPrisma.trainingSession.findUnique.mockResolvedValue(null);

    await expect(saveResult(validSaveData)).rejects.toThrow(
      'Session not found: existing-session'
    );

    expect(mockedPrisma.trainingResult.create).not.toHaveBeenCalled();
  });

  it('異常: セッション不存在時にtrainingResult.createは呼ばれない', async () => {
    mockedPrisma.trainingSession.findUnique.mockResolvedValue(null);

    await expect(saveResult(validSaveData)).rejects.toThrow();
    expect(mockedPrisma.trainingResult.create).not.toHaveBeenCalled();
  });
});
