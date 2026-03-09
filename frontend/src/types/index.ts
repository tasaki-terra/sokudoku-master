/** トレーニング種類 */
export type TrainingType =
  | 'horizontal'
  | 'vertical'
  | 'diagonal'
  | 'complex'
  | 'sequence'
  | 'continuous';

/** トレーニング種類の表示名 */
export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  horizontal: '水平方向',
  vertical: '垂直方向',
  diagonal: '斜め方向',
  complex: '複合',
  sequence: '順番追跡',
  continuous: '連続水平',
} as const;

/** クイズ回答 */
export interface QuizAnswer {
  questionIndex: number;
  selectedOption: number;
  correctOption: number;
  isCorrect: boolean;
}

/** トレーニング記録 */
export interface TrainingRecord {
  id: string;
  type: TrainingType;
  level: number;
  score: number;
  correctRate: number;
  earnedPoints: number;
  quizAnswers: QuizAnswer[];
  createdAt: string;
}

/** ユーザー進捗 */
export interface UserProgress {
  totalPoints: number;
  currentLevel: number;
  totalTrainings: number;
  bestScores: Record<TrainingType, number>;
}

/** グリッドセル（API用） */
export interface GridCell {
  id: number;
  symbol: string;
  color: string;
  isSpecial: boolean;
  row: number;
  col: number;
}

/** クイズ問題（API用） */
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

/** トレーニングセッション開始リクエスト */
export interface StartTrainingRequest {
  type: TrainingType;
  level: number;
}

/** トレーニングセッション開始レスポンス */
export interface StartTrainingResponse {
  sessionId: string;
  grid: GridCell[];
  displayOrder: number[];
  intervalMs: number;
  gridSize: number;
}

/** トレーニング結果保存リクエスト */
export interface SaveTrainingResultRequest {
  sessionId: string;
  type: TrainingType;
  level: number;
  score: number;
  correctRate: number;
  earnedPoints: number;
  quizAnswers: QuizAnswer[];
}

/** トレーニング記録一覧リクエスト（フィルタ・ページネーション） */
export interface TrainingRecordListRequest {
  type?: TrainingType;
  page?: number;
  limit?: number;
}

/** トレーニング記録一覧レスポンス */
export interface TrainingRecordListResponse {
  records: TrainingRecord[];
  total: number;
}

/** 記録統計サマリーレスポンス */
export interface RecordStatsResponse {
  totalTrainings: number;
  currentLevel: number;
  totalPoints: number;
  averageCorrectRate: number;
}

/** ナビゲーションアイテム */
export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

/** APIエンドポイント定義 */
export const API_PATHS = {
  TRAINING: {
    START: '/api/training/start',
    SAVE_RESULT: '/api/training/result',
    LIST: '/api/training/records',
    DETAIL: (id: string) => `/api/training/records/${id}`,
  },
  RECORDS: {
    STATS: '/api/records/stats',
  },
  PROGRESS: {
    GET: '/api/progress',
    BEST_SCORES: '/api/progress/best-scores',
  },
} as const;
