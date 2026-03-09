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

/** ナビゲーションアイテム */
export interface NavItem {
  label: string;
  path: string;
  icon: string;
}
