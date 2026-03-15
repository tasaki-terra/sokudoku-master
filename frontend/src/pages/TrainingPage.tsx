import { useState, useCallback } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import type { TrainingType } from '@/types';
import { useStartTraining, useSaveTrainingResult } from '@/hooks/useTraining';
import { TrainingSelect } from './Training/TrainingSelect';
import { TrainingExecution } from './Training/TrainingExecution';
import { TrainingResult } from './Training/TrainingResult';
import { calculateCompletionScore } from './Training/trainingLogic';

type Step = 'select' | 'execute' | 'result';

export const TrainingPage = () => {
  const [step, setStep] = useState<Step>('select');
  const [selectedType, setSelectedType] = useState<TrainingType>('horizontal');
  const [level, setLevel] = useState(1);
  const [result, setResult] = useState({ score: 0, earnedPoints: 0 });
  const [sessionId, setSessionId] = useState<string | null>(null);

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
            setStep('execute');
          },
        },
      );
    },
    [level, startTrainingMutation],
  );

  const handleTrainingComplete = useCallback(() => {
    const { score, earnedPoints } = calculateCompletionScore(level);

    if (!sessionId) return;

    saveResultMutation.mutate(
      {
        sessionId,
        type: selectedType,
        level,
        score,
        correctRate: score,
        earnedPoints,
        quizAnswers: [],
      },
      {
        onSuccess: (record) => {
          setResult({ score: record.score, earnedPoints: record.earnedPoints });
          setStep('result');
        },
      },
    );
  }, [level, selectedType, sessionId, saveResultMutation]);

  const handleRetry = useCallback(() => {
    setSessionId(null);
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
      {!isLoading && step === 'result' && (
        <TrainingResult
          score={result.score}
          earnedPoints={result.earnedPoints}
          type={selectedType}
          onRetry={handleRetry}
        />
      )}
    </Box>
  );
};
