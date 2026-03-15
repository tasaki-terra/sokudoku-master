import { prisma } from '../lib/prisma';
import type {
  TrainingRecord,
  TrainingRecordListResponse,
  TrainingType,
  QuizAnswer,
} from '../types';

function toTrainingRecord(result: {
  id: string;
  type: string;
  level: number;
  score: number;
  correctRate: number;
  earnedPoints: number;
  quizAnswers: unknown;
  createdAt: Date;
}): TrainingRecord {
  return {
    id: result.id,
    type: result.type as TrainingType,
    level: result.level,
    score: result.score,
    correctRate: result.correctRate,
    earnedPoints: result.earnedPoints,
    quizAnswers: result.quizAnswers as QuizAnswer[],
    createdAt: result.createdAt.toISOString(),
  };
}

export async function getRecords(query: {
  type?: TrainingType;
  page: number;
  limit: number;
}): Promise<TrainingRecordListResponse> {
  const where = query.type ? { type: query.type } : {};
  const skip = (query.page - 1) * query.limit;

  const [results, total] = await Promise.all([
    prisma.trainingResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.limit,
    }),
    prisma.trainingResult.count({ where }),
  ]);

  return {
    records: results.map(toTrainingRecord),
    total,
  };
}

export async function getRecordById(id: string): Promise<TrainingRecord | null> {
  const result = await prisma.trainingResult.findUnique({
    where: { id },
  });

  if (!result) return null;

  return toTrainingRecord(result);
}
