import { useQuery } from '@tanstack/react-query';
import type { TrainingRecordListRequest } from '@/types';
import { getTrainingRecords, getTrainingRecord } from '@/services/api/training';

export const useTrainingRecords = (params?: TrainingRecordListRequest) => {
  return useQuery({
    queryKey: ['trainingRecords', params],
    queryFn: () => getTrainingRecords(params),
  });
};

export const useTrainingRecord = (id: string) => {
  return useQuery({
    queryKey: ['trainingRecords', id],
    queryFn: () => getTrainingRecord(id),
    enabled: id !== '',
  });
};
