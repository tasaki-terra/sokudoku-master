import type { TrainingType } from '@/types';

/** グリッドセルの情報 */
export interface GridCell {
  id: number;
  symbol: string;
  color: string;
  isSpecial: boolean;
  row: number;
  col: number;
}

/** クイズ問題 */
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

const NORMAL_SYMBOLS = ['○', '○', '○', '○', '○'];
const SPECIAL_SYMBOLS = ['★', '♦', '▲', '◆', '♥'];
const COLORS = ['#E53935', '#1E88E5', '#43A047'];

/** レベルに応じた表示間隔(ms) */
export const getLevelInterval = (level: number): number => {
  const intervals = [2000, 1600, 1200, 800, 400, 0];
  return intervals[level - 1] ?? 1200;
};

/** グリッドサイズをレベルに応じて決定 */
const getGridSize = (level: number): number => {
  if (level <= 2) return 4;
  if (level <= 4) return 5;
  return 6;
};

/** トレーニングタイプに基づく表示順序を生成 */
const getDisplayOrder = (type: TrainingType, size: number): number[] => {
  const indices: number[] = [];
  const total = size * size;

  switch (type) {
    case 'horizontal':
      for (let r = 0; r < size; r++) {
        const row = r % 2 === 0
          ? Array.from({ length: size }, (_, c) => r * size + c)
          : Array.from({ length: size }, (_, c) => r * size + (size - 1 - c));
        indices.push(...row);
      }
      break;
    case 'vertical':
      for (let c = 0; c < size; c++) {
        const col = c % 2 === 0
          ? Array.from({ length: size }, (_, r) => r * size + c)
          : Array.from({ length: size }, (_, r) => (size - 1 - r) * size + c);
        indices.push(...col);
      }
      break;
    case 'diagonal':
      for (let i = 0; i < size; i++) {
        indices.push(i * size + i);
      }
      for (let i = 0; i < size; i++) {
        indices.push(i * size + (size - 1 - i));
      }
      break;
    case 'complex':
      for (let c = 0; c < size; c++) {
        indices.push(c);
      }
      for (let i = 1; i < size; i++) {
        indices.push(i * size + (i % 2 === 0 ? 0 : size - 1));
      }
      break;
    case 'sequence':
      {
        const shuffled = Array.from({ length: total }, (_, i) => i);
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        indices.push(...shuffled);
      }
      break;
    case 'continuous':
      for (let r = 0; r < size; r++) {
        indices.push(...Array.from({ length: size }, (_, c) => r * size + c));
      }
      break;
    default:
      indices.push(...Array.from({ length: total }, (_, i) => i));
  }

  return indices;
};

/** グリッドデータを生成 */
export const generateGrid = (_type: TrainingType, level: number): GridCell[] => {
  const size = getGridSize(level);
  const total = size * size;
  const specialCount = Math.min(3 + Math.floor(level / 2), 5);
  const specialIndices = new Set<number>();

  while (specialIndices.size < specialCount) {
    specialIndices.add(Math.floor(Math.random() * total));
  }

  return Array.from({ length: total }, (_, i) => {
    const isSpecial = specialIndices.has(i);
    const symbol = isSpecial
      ? SPECIAL_SYMBOLS[Math.floor(Math.random() * SPECIAL_SYMBOLS.length)]
      : NORMAL_SYMBOLS[0];
    const color = isSpecial
      ? COLORS[Math.floor(Math.random() * COLORS.length)]
      : '#3E2723';

    return {
      id: i,
      symbol,
      color,
      isSpecial,
      row: Math.floor(i / size),
      col: i % size,
    };
  });
};

/** 表示順序を取得 */
export const getOrder = (type: TrainingType, level: number): number[] => {
  const size = getGridSize(level);
  return getDisplayOrder(type, size);
};

/** グリッドサイズを取得 */
export const getSize = (level: number): number => getGridSize(level);

/** クイズ問題を生成 */
export const generateQuiz = (grid: GridCell[]): QuizQuestion[] => {
  const specialCells = grid.filter((c) => c.isSpecial);
  const allSymbols = [...SPECIAL_SYMBOLS, ...NORMAL_SYMBOLS.slice(0, 1)];
  const questions: QuizQuestion[] = [];

  const questionCount = Math.min(specialCells.length, 4);

  for (let i = 0; i < questionCount; i++) {
    const target = specialCells[i];
    const correctAnswer = `${target.symbol}（${colorName(target.color)}）`;
    const options = [correctAnswer];

    while (options.length < 4) {
      const sym = allSymbols[Math.floor(Math.random() * allSymbols.length)];
      const col = COLORS[Math.floor(Math.random() * COLORS.length)];
      const opt = `${sym}（${colorName(col)}）`;
      if (!options.includes(opt)) {
        options.push(opt);
      }
    }

    const shuffled = options.sort(() => Math.random() - 0.5);

    questions.push({
      question: `${i + 1}番目に見つけた特殊記号はどれ？`,
      options: shuffled,
      correctIndex: shuffled.indexOf(correctAnswer),
    });
  }

  return questions;
};

const colorName = (hex: string): string => {
  if (hex === '#E53935') return '赤';
  if (hex === '#1E88E5') return '青';
  if (hex === '#43A047') return '緑';
  return '黒';
};

/** スコアを計算 */
export const calculateScore = (
  correctCount: number,
  totalQuestions: number,
  level: number,
): { score: number; correctRate: number; earnedPoints: number } => {
  const correctRate = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const baseScore = correctRate * level;
  const earnedPoints = Math.round(baseScore / 10);
  return { score: baseScore, correctRate, earnedPoints };
};
