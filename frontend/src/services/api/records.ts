import type { RecordStatsResponse } from '../../types';

/**
 * @API_INTEGRATION
 * エンドポイント: GET /api/records/stats
 * レスポンス: RecordStatsResponse
 * 認証: 必要
 */
export const getRecordStats = async (): Promise<RecordStatsResponse> => {
  // TODO: Phase 8でAPI接続実装
  throw new Error('API not implemented');
};
