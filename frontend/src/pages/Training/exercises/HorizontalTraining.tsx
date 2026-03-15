import { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import { LazyMotion, domAnimation } from 'framer-motion';
import { TrainingHeader } from './TrainingHeader';
import { CountdownOverlay } from './CountdownOverlay';
import { TrainingBoard, TrainingLayout } from './TrainingBoard';
import { CircleSymbol } from './CircleSymbol';
import { useTrainingTimer } from './useTrainingTimer';
import { useAutoAdvance, getLevelSpeed } from './useAutoAdvance';

interface HorizontalTrainingProps {
  level: number;
  onComplete: () => void;
  onExit: () => void;
}

const ROWS = 5;
const POSITIONS_PER_ROW = 2;
const TOTAL_POSITIONS = ROWS * POSITIONS_PER_ROW;

export const HorizontalTraining = ({ level, onComplete }: HorizontalTrainingProps) => {
  const [phase, setPhase] = useState<'countdown' | 'training'>('countdown');
  const speed = getLevelSpeed(level);

  const { timeLeft, start } = useTrainingTimer(onComplete);
  const { currentPosition } = useAutoAdvance(TOTAL_POSITIONS, speed, phase === 'training');

  const handleCountdownComplete = useCallback(() => {
    setPhase('training');
    start();
  }, [start]);

  const speedText = level === 6 ? '同時表示' : `${speed / 1000}秒間隔`;

  return (
    <LazyMotion features={domAnimation}>
      {phase === 'countdown' && (
        <CountdownOverlay
          title="水平移動トレーニング"
          instruction="濃くなっている○印を目で追いかけてね！"
          characters="👀➡️🐇"
          onComplete={handleCountdownComplete}
        />
      )}
      <TrainingHeader title="視覚開発FMI表" timeLeft={timeLeft} onExit={onComplete} />
      <TrainingLayout>
        <TrainingBoard info={`レベル${level}: ${speedText} / 5行水平移動`}>
          {Array.from({ length: ROWS }, (_, row) => (
            <HorizontalRow
              key={row}
              row={row}
              currentPosition={currentPosition}
            />
          ))}
          <ProgressDots total={TOTAL_POSITIONS} current={currentPosition} />
        </TrainingBoard>
      </TrainingLayout>
    </LazyMotion>
  );
};

interface HorizontalRowProps {
  row: number;
  currentPosition: number;
}

const HorizontalRow = ({ row, currentPosition }: HorizontalRowProps) => {
  const leftIndex = row * POSITIONS_PER_ROW;
  const rightIndex = leftIndex + 1;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        my: '30px',
        position: 'relative',
      }}
    >
      <CircleSymbol active={currentPosition === leftIndex} />
      <ConnectionLine />
      <CircleSymbol active={currentPosition === rightIndex} />
    </Box>
  );
};

const ConnectionLine = () => (
  <Box
    sx={{
      flex: 1,
      height: 2,
      bgcolor: '#a5d6a7',
      mx: 4,
    }}
  />
);

const ProgressDots = ({ total, current }: { total: number; current: number }) => (
  <Box
    sx={{
      position: 'absolute',
      bottom: 10,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '8px',
    }}
  >
    {Array.from({ length: total }, (_, i) => (
      <Box
        key={i}
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: i < current ? '#4CAF50' : i === current ? '#2e7d32' : '#e0e0e0',
          transition: 'background 0.3s ease',
        }}
      />
    ))}
  </Box>
);
