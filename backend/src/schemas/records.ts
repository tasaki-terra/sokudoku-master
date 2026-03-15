import { z } from 'zod';

const TRAINING_TYPES = [
  'horizontal',
  'vertical',
  'diagonal',
  'complex',
  'sequence',
  'continuous',
] as const;

export const recordsListQuerySchema = z.object({
  type: z.enum(TRAINING_TYPES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
