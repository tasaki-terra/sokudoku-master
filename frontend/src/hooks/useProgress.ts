import { useQuery } from '@tanstack/react-query';
import { getRecordStats } from '@/services/api/records';
import { getUserProgress } from '@/services/api/training';
import { getBestScores } from '@/services/api/progress';

export const useRecordStats = () => {
  return useQuery({
    queryKey: ['recordStats'],
    queryFn: getRecordStats,
  });
};

export const useUserProgress = () => {
  return useQuery({
    queryKey: ['userProgress'],
    queryFn: getUserProgress,
  });
};

export const useBestScores = () => {
  return useQuery({
    queryKey: ['bestScores'],
    queryFn: getBestScores,
  });
};
