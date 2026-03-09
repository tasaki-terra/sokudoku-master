import { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import type { TrainingType } from '@/types';
import { useProgressStore } from '@/stores/useProgressStore';
import { TrainingSelect } from './Training/TrainingSelect';
import { TrainingExecution } from './Training/TrainingExecution';
import { TrainingQuiz } from './Training/TrainingQuiz';
import { TrainingResult } from './Training/TrainingResult';
import { generateQuiz, calculateScore } from './Training/trainingLogic';
import type { GridCell, QuizQuestion } from './Training/trainingLogic';

type Step = 'select' | 'execute' | 'quiz' | 'result';

export const TrainingPage = () => {
  const [step, setStep] = useState<Step>('select');
  const [selectedType, setSelectedType] = useState<TrainingType>('horizontal');
  const [level, setLevel] = useState(1);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [result, setResult] = useState({ score: 0, correctRate: 0, earnedPoints: 0 });

  const { addPoints, incrementTrainings, updateBestScore } = useProgressStore();

  const handleSelect = useCallback((type: TrainingType) => {
    setSelectedType(type);
    setStep('execute');
  }, []);

  const handleTrainingComplete = useCallback((grid: GridCell[]) => {
    const questions = generateQuiz(grid);
    setQuizQuestions(questions);
    setStep('quiz');
  }, []);

  const handleQuizComplete = useCallback((answers: boolean[]) => {
    const correctCount = answers.filter(Boolean).length;
    const { score, correctRate, earnedPoints } = calculateScore(correctCount, answers.length, level);
    setResult({ score, correctRate, earnedPoints });

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
      {step === 'quiz' && (
        <TrainingQuiz questions={quizQuestions} onComplete={handleQuizComplete} />
      )}
      {step === 'result' && (
        <TrainingResult
          score={result.score}
          correctRate={result.correctRate}
          earnedPoints={result.earnedPoints}
          type={selectedType}
          onRetry={handleRetry}
        />
      )}
    </Box>
  );
};
