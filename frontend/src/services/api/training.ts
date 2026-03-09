import type {
  StartTrainingRequest,
  StartTrainingResponse,
  SaveTrainingResultRequest,
  TrainingRecord,
  TrainingRecordListRequest,
  TrainingRecordListResponse,
  UserProgress,
} from '../../types';

/**
 * @API_INTEGRATION
 * エンドポイント: POST /api/training/start
 * リクエスト: StartTrainingRequest
 * レスポンス: StartTrainingResponse
 * 認証: 必要
 */
export const startTraining = async (_data: StartTrainingRequest): Promise<StartTrainingResponse> => {
  // TODO: Phase 8でAPI接続実装
  throw new Error('API not implemented');
};

/**
 * @API_INTEGRATION
 * エンドポイント: POST /api/training/result
 * リクエスト: SaveTrainingResultRequest
 * レスポンス: TrainingRecord
 * 認証: 必要
 */
export const saveTrainingResult = async (_data: SaveTrainingResultRequest): Promise<TrainingRecord> => {
  // TODO: Phase 8でAPI接続実装
  throw new Error('API not implemented');
};

/**
 * @API_INTEGRATION
 * エンドポイント: GET /api/training/records
 * リクエスト: TrainingRecordListRequest（クエリパラメータ）
 * レスポンス: TrainingRecordListResponse
 * 認証: 必要
 */
export const getTrainingRecords = async (
  _params?: TrainingRecordListRequest,
): Promise<TrainingRecordListResponse> => {
  // TODO: Phase 8でAPI接続実装
  throw new Error('API not implemented');
};

/**
 * @API_INTEGRATION
 * エンドポイント: GET /api/training/records/:id
 * レスポンス: TrainingRecord
 * 認証: 必要
 */
export const getTrainingRecord = async (_id: string): Promise<TrainingRecord> => {
  // TODO: Phase 8でAPI接続実装
  throw new Error('API not implemented');
};

/**
 * @API_INTEGRATION
 * エンドポイント: GET /api/progress
 * レスポンス: UserProgress
 * 認証: 必要
 */
export const getUserProgress = async (): Promise<UserProgress> => {
  // TODO: Phase 8でAPI接続実装
  throw new Error('API not implemented');
};
