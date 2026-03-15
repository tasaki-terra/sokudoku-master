import type {
  StartTrainingRequest,
  StartTrainingResponse,
  SaveTrainingResultRequest,
  TrainingRecord,
  TrainingRecordListRequest,
  TrainingRecordListResponse,
  UserProgress,
} from '../../types';
import { API_PATHS } from '../../types';
import { get, post } from './client';

export const startTraining = async (data: StartTrainingRequest): Promise<StartTrainingResponse> => {
  return post<StartTrainingResponse>(API_PATHS.TRAINING.START, data);
};

export const saveTrainingResult = async (data: SaveTrainingResultRequest): Promise<TrainingRecord> => {
  return post<TrainingRecord>(API_PATHS.TRAINING.SAVE_RESULT, data);
};

export const getTrainingRecords = async (
  params?: TrainingRecordListRequest,
): Promise<TrainingRecordListResponse> => {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.page != null) query.set('page', String(params.page));
  if (params?.limit != null) query.set('limit', String(params.limit));
  const qs = query.toString();
  const path = qs ? `${API_PATHS.TRAINING.LIST}?${qs}` : API_PATHS.TRAINING.LIST;
  return get<TrainingRecordListResponse>(path);
};

export const getTrainingRecord = async (id: string): Promise<TrainingRecord> => {
  return get<TrainingRecord>(API_PATHS.TRAINING.DETAIL(id));
};

export const getUserProgress = async (): Promise<UserProgress> => {
  return get<UserProgress>(API_PATHS.PROGRESS.GET);
};
