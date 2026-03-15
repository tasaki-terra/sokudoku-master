import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StartTrainingRequest, SaveTrainingResultRequest } from '@/types';
import { startTraining, saveTrainingResult } from '@/services/api/training';

export const useStartTraining = () => {
  return useMutation({
    mutationFn: (data: StartTrainingRequest) => startTraining(data),
  });
};

export const useSaveTrainingResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveTrainingResultRequest) => saveTrainingResult(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingRecords'] });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      queryClient.invalidateQueries({ queryKey: ['recordStats'] });
      queryClient.invalidateQueries({ queryKey: ['bestScores'] });
    },
  });
};
