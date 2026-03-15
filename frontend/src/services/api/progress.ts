import type { TrainingType } from '../../types';
import { API_PATHS } from '../../types';
import { get } from './client';

export const getBestScores = async (): Promise<Record<TrainingType, number>> => {
  return get<Record<TrainingType, number>>(API_PATHS.PROGRESS.BEST_SCORES);
};
