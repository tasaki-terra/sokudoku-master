import type { QuizAnswer } from '@/types';

/** レベルに応じた表示間隔(ms) */
export const getLevelInterval = (level: number): number => {
  const intervals = [2000, 1600, 1200, 800, 400, 0];
  return intervals[level - 1] ?? 1200;
};

/** レベルに応じたポイント倍率 */
const LEVEL_MULTIPLIER: Record<number, number> = {
  1: 1.0,
  2: 1.2,
  3: 1.5,
  4: 2.0,
  5: 2.5,
  6: 3.0,
};

/** クイズ結果を含むスコア計算 */
export const calculateQuizScore = (
  level: number,
  quizAnswers: QuizAnswer[],
): { score: number; earnedPoints: number; correctRate: number } => {
  const total = quizAnswers.length;
  if (total === 0) return { score: 0, earnedPoints: 0, correctRate: 0 };

  const correctCount = quizAnswers.filter((a) => a.isCorrect).length;
  const correctRate = Math.round((correctCount / total) * 100);

  const basePoints = correctCount * 10;
  const allCorrectBonus = correctCount === total ? 20 : 0;
  const multiplier = LEVEL_MULTIPLIER[level] ?? 1.0;
  const earnedPoints = Math.round((basePoints + allCorrectBonus) * multiplier);

  const score = Math.round(correctRate * multiplier);

  return { score, earnedPoints, correctRate };
};

/** トレーニング完了時のスコアを計算（後方互換用） */
export const calculateCompletionScore = (
  level: number,
): { score: number; earnedPoints: number } => {
  const score = 100 * level;
  const earnedPoints = level * 10;
  return { score, earnedPoints };
};
