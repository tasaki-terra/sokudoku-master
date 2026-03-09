import { useCallback } from 'react';
import type { TrainingType } from '@/types';
import { generateGrid } from './trainingLogic';
import type { GridCell } from './trainingLogic';
import { BasicTraining } from './exercises/BasicTraining';
import { HorizontalTraining } from './exercises/HorizontalTraining';
import { VerticalTraining } from './exercises/VerticalTraining';
import { DiagonalTraining } from './exercises/DiagonalTraining';
import { SequenceTraining } from './exercises/SequenceTraining';
import { ComplexTraining } from './exercises/ComplexTraining';

interface TrainingExecutionProps {
  type: TrainingType;
  level: number;
  onComplete: (grid: GridCell[]) => void;
}

export const TrainingExecution = ({ type, level, onComplete }: TrainingExecutionProps) => {
  const handleComplete = useCallback(() => {
    const grid = generateGrid(type, level);
    onComplete(grid);
  }, [type, level, onComplete]);

  const handleExit = useCallback(() => {
    const grid = generateGrid(type, level);
    onComplete(grid);
  }, [type, level, onComplete]);

  const props = { level, onComplete: handleComplete, onExit: handleExit };

  switch (type) {
    case 'continuous':
      return <BasicTraining {...props} />;
    case 'horizontal':
      return <HorizontalTraining {...props} />;
    case 'vertical':
      return <VerticalTraining {...props} />;
    case 'diagonal':
      return <DiagonalTraining {...props} />;
    case 'sequence':
      return <SequenceTraining {...props} />;
    case 'complex':
      return <ComplexTraining {...props} />;
    default:
      return <HorizontalTraining {...props} />;
  }
};
