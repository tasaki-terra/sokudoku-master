import { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import { TrainingHeader } from './TrainingHeader';
import { CountdownOverlay } from './CountdownOverlay';
import { TrainingBoard, TrainingLayout } from './TrainingBoard';
import { CircleSymbol } from './CircleSymbol';
import { useTrainingTimer } from './useTrainingTimer';
import { useAutoAdvance, getLevelSpeed } from './useAutoAdvance';

interface VerticalTrainingProps {
  level: number;
  onComplete: () => void;
  onExit: () => void;
}

const COLUMNS = 5;
const POSITIONS_PER_COL = 2;
const TOTAL_POSITIONS = COLUMNS * POSITIONS_PER_COL;

export const VerticalTraining = ({ level, onComplete, onExit }: VerticalTrainingProps) => {
  const [phase, setPhase] = useState<'countdown' | 'training'>('countdown');
  const speed = getLevelSpeed(level);

  const handleTimeUp = useCallback(() => onComplete(), [onComplete]);
  const { timeLeft, start } = useTrainingTimer(handleTimeUp);
  const { currentPosition } = useAutoAdvance(TOTAL_POSITIONS, speed, phase === 'training');

  const handleCountdownComplete = useCallback(() => {
    setPhase('training');
    start();
  }, [start]);

  const speedText = level === 6 ? '同時表示' : `${speed / 1000}秒間隔`;

  return (
    <>
      {phase === 'countdown' && (
        <CountdownOverlay
          title="垂直移動トレーニング"
          instruction="濃くなっている○印を目で追いかけてね！"
          characters="👀⬆️🐸"
          onComplete={handleCountdownComplete}
        />
      )}
      <TrainingHeader title="視覚開発FMII表" timeLeft={timeLeft} onExit={onExit} />
      <TrainingLayout>
        <TrainingBoard info={`レベル${level}: ${speedText} / 5列垂直移動`}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              height: 400,
              position: 'relative',
            }}
          >
            {Array.from({ length: COLUMNS }, (_, col) => {
              const topIndex = col * POSITIONS_PER_COL;
              const bottomIndex = topIndex + 1;
              const topActive = currentPosition === topIndex;
              const bottomActive = currentPosition === bottomIndex;
              return (
                <Box
                  key={col}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    alignItems: 'center',
                  }}
                >
                  <CircleSymbol active={topActive} />
                  <VerticalLine />
                  <CircleSymbol active={bottomActive} />
                </Box>
              );
            })}
          </Box>
          <ProgressDots total={TOTAL_POSITIONS} current={currentPosition} />
        </TrainingBoard>
      </TrainingLayout>
    </>
  );
};

const VerticalLine = () => (
  <Box
    sx={{
      flex: 1,
      width: 2,
      bgcolor: '#a5d6a7',
      my: 4,
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
