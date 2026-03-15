import { prisma } from '../lib/prisma';
import type {
  StartTrainingRequest,
  StartTrainingResponse,
  SaveTrainingResultRequest,
  TrainingRecord,
  GridCell,
  TrainingType,
} from '../types';

const SPECIAL_SYMBOLS = ['★', '♦', '♥', '♣'];
const SPECIAL_COLORS = ['#FF4444', '#4444FF', '#44AA44'];
const NORMAL_SYMBOL = '○';
const NORMAL_COLOR = '#666';

function getGridSize(level: number): number {
  if (level <= 2) return 4;
  if (level <= 4) return 5;
  return 6;
}

function getIntervalMs(level: number): number {
  const intervals: Record<number, number> = {
    1: 2000,
    2: 1000,
    3: 500,
    4: 250,
    5: 100,
    6: 50,
  };
  return intervals[level] ?? 1000;
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateGrid(gridSize: number): GridCell[] {
  const totalCells = gridSize * gridSize;
  const specialCount = gridSize - 1;
  const cells: GridCell[] = [];

  // Pick random positions for special cells
  const indices = Array.from({ length: totalCells }, (_, i) => i);
  const specialIndices = new Set<number>();
  while (specialIndices.size < specialCount) {
    const idx = indices[Math.floor(Math.random() * indices.length)];
    specialIndices.add(idx);
  }

  for (let i = 0; i < totalCells; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    const isSpecial = specialIndices.has(i);
    cells.push({
      id: i,
      symbol: isSpecial ? randomItem(SPECIAL_SYMBOLS) : NORMAL_SYMBOL,
      color: isSpecial ? randomItem(SPECIAL_COLORS) : NORMAL_COLOR,
      isSpecial,
      row,
      col,
    });
  }

  return cells;
}

function generateDisplayOrder(type: TrainingType, gridSize: number): number[] {
  const total = gridSize * gridSize;

  switch (type) {
    case 'horizontal':
    case 'continuous':
      // Left→right, top→bottom (natural order)
      return Array.from({ length: total }, (_, i) => i);

    case 'vertical':
      // Top→bottom, left→right (column-first)
      return Array.from({ length: total }, (_, i) => {
        const col = Math.floor(i / gridSize);
        const row = i % gridSize;
        return row * gridSize + col;
      });

    case 'diagonal':
      return generateDiagonalOrder(gridSize);

    case 'complex':
      return generateComplexOrder(gridSize);

    case 'sequence': {
      // Random order
      const order = Array.from({ length: total }, (_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      return order;
    }
  }
}

function generateDiagonalOrder(gridSize: number): number[] {
  const order: number[] = [];
  // Traverse diagonals (top-left to bottom-right)
  for (let d = 0; d < 2 * gridSize - 1; d++) {
    const startRow = d < gridSize ? 0 : d - gridSize + 1;
    const startCol = d < gridSize ? d : gridSize - 1;
    let row = startRow;
    let col = startCol;
    while (row < gridSize && col >= 0) {
      order.push(row * gridSize + col);
      row++;
      col--;
    }
  }
  return order;
}

function generateComplexOrder(gridSize: number): number[] {
  // Alternate between vertical columns and diagonal passes
  const vertical = Array.from({ length: gridSize * gridSize }, (_, i) => {
    const col = Math.floor(i / gridSize);
    const row = i % gridSize;
    return row * gridSize + col;
  });
  const diagonal = generateDiagonalOrder(gridSize);

  const order: number[] = [];
  const added = new Set<number>();
  const sources = [vertical, diagonal];
  const pointers = [0, 0];

  let sourceIdx = 0;
  while (order.length < gridSize * gridSize) {
    const src = sources[sourceIdx];
    if (pointers[sourceIdx] < src.length) {
      const val = src[pointers[sourceIdx]];
      pointers[sourceIdx]++;
      if (!added.has(val)) {
        added.add(val);
        order.push(val);
      }
    }
    sourceIdx = (sourceIdx + 1) % 2;
  }

  return order;
}

export async function startTraining(
  data: StartTrainingRequest
): Promise<StartTrainingResponse> {
  const gridSize = getGridSize(data.level);
  const intervalMs = getIntervalMs(data.level);
  const grid = generateGrid(gridSize);
  const displayOrder = generateDisplayOrder(data.type, gridSize);

  const session = await prisma.trainingSession.create({
    data: {
      type: data.type,
      level: data.level,
      gridSize,
      intervalMs,
      grid: JSON.parse(JSON.stringify(grid)),
      displayOrder: JSON.parse(JSON.stringify(displayOrder)),
    },
  });

  return {
    sessionId: session.id,
    grid,
    displayOrder,
    intervalMs,
    gridSize,
  };
}

export async function saveResult(
  data: SaveTrainingResultRequest
): Promise<TrainingRecord> {
  // Verify session exists
  const session = await prisma.trainingSession.findUnique({
    where: { id: data.sessionId },
  });
  if (!session) {
    throw new Error(`Session not found: ${data.sessionId}`);
  }

  const result = await prisma.trainingResult.create({
    data: {
      sessionId: data.sessionId,
      type: data.type,
      level: data.level,
      score: data.score,
      correctRate: data.correctRate,
      earnedPoints: data.earnedPoints,
      quizAnswers: JSON.parse(JSON.stringify(data.quizAnswers)),
    },
  });

  return {
    id: result.id,
    type: result.type as TrainingType,
    level: result.level,
    score: result.score,
    correctRate: result.correctRate,
    earnedPoints: result.earnedPoints,
    quizAnswers: result.quizAnswers as unknown as TrainingRecord['quizAnswers'],
    createdAt: result.createdAt.toISOString(),
  };
}
