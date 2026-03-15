import { prisma } from '../lib/prisma';
import type { RecordStatsResponse, UserProgress, TrainingType } from '../types';

const ALL_TRAINING_TYPES: TrainingType[] = [
  'horizontal',
  'vertical',
  'diagonal',
  'complex',
  'sequence',
  'continuous',
];

export async function getStats(): Promise<RecordStatsResponse> {
  const [aggregation, totalTrainings] = await Promise.all([
    prisma.trainingResult.aggregate({
      _sum: { earnedPoints: true },
      _avg: { correctRate: true },
    }),
    prisma.trainingResult.count(),
  ]);

  const totalPoints = aggregation._sum.earnedPoints ?? 0;
  const averageCorrectRate = aggregation._avg.correctRate ?? 0;
  const currentLevel = Math.max(1, Math.ceil(totalPoints / 100));

  return {
    totalTrainings,
    currentLevel,
    totalPoints,
    averageCorrectRate: Math.round(averageCorrectRate * 100) / 100,
  };
}

export async function getBestScores(): Promise<Record<TrainingType, number>> {
  const results = await prisma.trainingResult.groupBy({
    by: ['type'],
    _max: { score: true },
  });

  const bestScores = {} as Record<TrainingType, number>;
  for (const t of ALL_TRAINING_TYPES) {
    bestScores[t] = 0;
  }
  for (const row of results) {
    bestScores[row.type as TrainingType] = row._max.score ?? 0;
  }

  return bestScores;
}

export async function getProgress(): Promise<UserProgress> {
  const [stats, bestScores] = await Promise.all([
    getStats(),
    getBestScores(),
  ]);

  return {
    totalPoints: stats.totalPoints,
    currentLevel: stats.currentLevel,
    totalTrainings: stats.totalTrainings,
    bestScores,
  };
}
