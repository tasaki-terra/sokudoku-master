import { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import type { TrainingType } from '@/types';
import { useProgressStore } from '@/stores/useProgressStore';
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

  const { addPoints, incrementTrainings, updateBestScore } = useProgressStore();

  const handleSelect = useCallback((type: TrainingType) => {
    setSelectedType(type);
    setStep('execute');
  }, []);

  const handleTrainingComplete = useCallback(() => {
    const { score, earnedPoints } = calculateCompletionScore(level);
    setResult({ score, earnedPoints });

    addPoints(earnedPoints);
    incrementTrainings();
    updateBestScore(selectedType, score);

    setStep('result');
  }, [level, selectedType, addPoints, incrementTrainings, updateBestScore]);

  const handleRetry = useCallback(() => {
    setStep('select');
  }, []);

  return (
    <Box sx={{ py: 1 }}>
      {step === 'select' && (
        <TrainingSelect level={level} onLevelChange={setLevel} onSelect={handleSelect} />
      )}
      {step === 'execute' && (
        <TrainingExecution type={selectedType} level={level} onComplete={handleTrainingComplete} />
      )}
      {step === 'result' && (
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
