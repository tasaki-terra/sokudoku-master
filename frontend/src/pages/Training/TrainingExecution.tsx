import type { TrainingType } from '@/types';
import { BasicTraining } from './exercises/BasicTraining';
import { HorizontalTraining } from './exercises/HorizontalTraining';
import { VerticalTraining } from './exercises/VerticalTraining';
import { DiagonalTraining } from './exercises/DiagonalTraining';
import { SequenceTraining } from './exercises/SequenceTraining';
import { ComplexTraining } from './exercises/ComplexTraining';

interface TrainingExecutionProps {
  type: TrainingType;
  level: number;
  onComplete: () => void;
}

export const TrainingExecution = ({ type, level, onComplete }: TrainingExecutionProps) => {
  const props = { level, onComplete, onExit: onComplete };

  switch (type) {
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
    case 'continuous':
    default:
      return <BasicTraining {...props} />;
  }
};
