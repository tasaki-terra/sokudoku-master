/** レベルに応じた表示間隔(ms) */
export const getLevelInterval = (level: number): number => {
  const intervals = [2000, 1600, 1200, 800, 400, 0];
  return intervals[level - 1] ?? 1200;
};

/** トレーニング完了時のスコアを計算 */
export const calculateCompletionScore = (
  level: number,
): { score: number; earnedPoints: number } => {
  const score = 100 * level;
  const earnedPoints = level * 10;
  return { score, earnedPoints };
};
