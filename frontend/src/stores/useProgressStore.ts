import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProgress, TrainingType } from '@/types';

const DEFAULT_BEST_SCORES: Record<TrainingType, number> = {
  horizontal: 0,
  vertical: 0,
  diagonal: 0,
  complex: 0,
  sequence: 0,
  continuous: 0,
};

interface ProgressState extends UserProgress {
  addPoints: (points: number) => void;
  incrementTrainings: () => void;
  updateBestScore: (type: TrainingType, score: number) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      totalPoints: 0,
      currentLevel: 1,
      totalTrainings: 0,
      bestScores: { ...DEFAULT_BEST_SCORES },

      addPoints: (points) =>
        set((state) => ({
          totalPoints: state.totalPoints + points,
        })),

      incrementTrainings: () =>
        set((state) => ({
          totalTrainings: state.totalTrainings + 1,
        })),

      updateBestScore: (type, score) =>
        set((state) => ({
          bestScores: {
            ...state.bestScores,
            [type]: Math.max(state.bestScores[type], score),
          },
        })),
    }),
    {
      name: 'sokudoku-progress',
    },
  ),
);
