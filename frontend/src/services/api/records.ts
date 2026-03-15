import type { RecordStatsResponse } from '../../types';
import { API_PATHS } from '../../types';
import { get } from './client';

export const getRecordStats = async (): Promise<RecordStatsResponse> => {
  return get<RecordStatsResponse>(API_PATHS.RECORDS.STATS);
};
