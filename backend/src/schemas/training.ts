import { z } from 'zod';

const TRAINING_TYPES = [
  'horizontal',
  'vertical',
  'diagonal',
  'complex',
  'sequence',
  'continuous',
] as const;

export const startTrainingSchema = z.object({
  type: z.enum(TRAINING_TYPES),
  level: z.number().int().min(1).max(6),
});

export const saveTrainingResultSchema = z.object({
  sessionId: z.string().min(1),
  type: z.enum(TRAINING_TYPES),
  level: z.number().int().min(1).max(6),
  score: z.number().int().min(0),
  correctRate: z.number().min(0).max(100),
  earnedPoints: z.number().int().min(0),
  quizAnswers: z.array(
    z.object({
      questionIndex: z.number().int().min(0),
      selectedOption: z.number().int().min(0),
      correctOption: z.number().int().min(0),
      isCorrect: z.boolean(),
    })
  ),
});
