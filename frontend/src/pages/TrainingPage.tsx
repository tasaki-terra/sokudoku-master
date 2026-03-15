import { useState, useCallback } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import type { TrainingType, QuizAnswer, GridCell } from '@/types';
import { useStartTraining, useSaveTrainingResult } from '@/hooks/useTraining';
import { TrainingSelect } from './Training/TrainingSelect';
import { TrainingExecution } from './Training/TrainingExecution';
import { TrainingQuiz } from './Training/TrainingQuiz';
import { TrainingResult } from './Training/TrainingResult';
import { calculateQuizScore } from './Training/trainingLogic';

type Step = 'select' | 'execute' | 'quiz' | 'result';

/** Extract ordered special symbols from grid cells */
const extractSpecialSymbols = (grid: GridCell[]): string[] =>
  grid.filter((c) => c.isSpecial).map((c) => c.symbol);

export const TrainingPage = () => {
  const [step, setStep] = useState<Step>('select');
  const [selectedType, setSelectedType] = useState<TrainingType>('horizontal');
  const [level, setLevel] = useState(1);
  const [result, setResult] = useState({ score: 0, earnedPoints: 0, correctRate: 0 });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [specialSymbols, setSpecialSymbols] = useState<string[]>([]);

  const startTrainingMutation = useStartTraining();
  const saveResultMutation = useSaveTrainingResult();

  const handleSelect = useCallback(
    (type: TrainingType) => {
      setSelectedType(type);
      startTrainingMutation.mutate(
        { type, level },
        {
          onSuccess: (data) => {
            setSessionId(data.sessionId);
            setSpecialSymbols(extractSpecialSymbols(data.grid));
            setStep('execute');
          },
        },
      );
    },
    [level, startTrainingMutation],
  );

  const handleTrainingComplete = useCallback(() => {
    setStep('quiz');
  }, []);

  const handleQuizComplete = useCallback(
    (quizAnswers: QuizAnswer[]) => {
      const { score, earnedPoints, correctRate } = calculateQuizScore(level, quizAnswers);

      if (!sessionId) return;

      saveResultMutation.mutate(
        {
          sessionId,
          type: selectedType,
          level,
          score,
          correctRate,
          earnedPoints,
          quizAnswers,
        },
        {
          onSuccess: (record) => {
            setResult({
              score: record.score,
              earnedPoints: record.earnedPoints,
              correctRate: record.correctRate,
            });
            setStep('result');
          },
        },
      );
    },
    [level, selectedType, sessionId, saveResultMutation],
  );

  const handleRetry = useCallback(() => {
    setSessionId(null);
    setSpecialSymbols([]);
    setStep('select');
  }, []);

  const isLoading = startTrainingMutation.isPending || saveResultMutation.isPending;
  const error = startTrainingMutation.error || saveResultMutation.error;

  return (
    <Box sx={{ py: 1 }}>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress size={40} />
        </Box>
      )}
      {error && (
        <Typography color="error" sx={{ textAlign: 'center', py: 2 }}>
          {error.message}
        </Typography>
      )}
      {!isLoading && step === 'select' && (
        <TrainingSelect level={level} onLevelChange={setLevel} onSelect={handleSelect} />
      )}
      {!isLoading && step === 'execute' && (
        <TrainingExecution type={selectedType} level={level} onComplete={handleTrainingComplete} />
      )}
      {!isLoading && step === 'quiz' && (
        <TrainingQuiz specialSymbols={specialSymbols} onComplete={handleQuizComplete} />
      )}
      {!isLoading && step === 'result' && (
        <TrainingResult
          score={result.score}
          earnedPoints={result.earnedPoints}
          correctRate={result.correctRate}
          type={selectedType}
          onRetry={handleRetry}
        />
      )}
    </Box>
  );
};
