import { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import { TrainingHeader } from './TrainingHeader';
import { CountdownOverlay } from './CountdownOverlay';
import { TrainingBoard, TrainingLayout } from './TrainingBoard';
import { CircleSymbol } from './CircleSymbol';
import { useTrainingTimer } from './useTrainingTimer';
import { useAutoAdvance, getLevelSpeed } from './useAutoAdvance';

interface SequenceTrainingProps {
  level: number;
  onComplete: () => void;
  onExit: () => void;
}

/** Sequence: top-right(1), bottom-left(2), top-left(3), bottom-right(4) */
const SEQUENCE_PATTERN: Array<{ row: number; col: number; number: number }> = [
  { row: 0, col: 2, number: 1 },
  { row: 2, col: 0, number: 2 },
  { row: 0, col: 0, number: 3 },
  { row: 2, col: 2, number: 4 },
];

const TOTAL_POSITIONS = 4;

export const SequenceTraining = ({ level, onComplete, onExit }: SequenceTrainingProps) => {
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
  const activePattern = SEQUENCE_PATTERN[currentPosition % TOTAL_POSITIONS];

  const getCornerData = (row: number, col: number) =>
    SEQUENCE_PATTERN.find((p) => p.row === row && p.col === col);

  const isCorner = (row: number, col: number): boolean =>
    (row === 0 || row === 2) && (col === 0 || col === 2);

  const isActive = (row: number, col: number): boolean =>
    phase === 'training' && activePattern.row === row && activePattern.col === col;

  return (
    <>
      {phase === 'countdown' && (
        <CountdownOverlay
          title="順番追跡トレーニング"
          instruction="濃くなっている○印を目で追いかけてね！"
          characters="👀🔢🐼"
          onComplete={handleCountdownComplete}
        />
      )}
      <TrainingHeader title="視覚開発FMI裏" timeLeft={timeLeft} onExit={onExit} />
      <TrainingLayout>
        <TrainingBoard height={700} info={`レベル${level}: ${speedText} / 順番追跡`}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(3, 1fr)',
              position: 'relative',
            }}
          >
            {Array.from({ length: 9 }, (_, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              const cornerData = getCornerData(row, col);
              return (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isCorner(row, col) && cornerData && (
                    <CircleSymbol size={48} active={isActive(row, col)} />
                  )}
                </Box>
              );
            })}
            <SequenceLines />
          </Box>
          <ProgressDots total={TOTAL_POSITIONS} current={currentPosition} />
        </TrainingBoard>
      </TrainingLayout>
    </>
  );
};

/** SVG lines connecting corners in sequence order */
const SequenceLines = () => (
  <Box
    component="svg"
    sx={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    }}
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    {/* 1(top-right) -> 2(bottom-left) */}
    <line x1="83" y1="17" x2="17" y2="83" stroke="#a5d6a7" strokeWidth="0.5" />
    {/* 2(bottom-left) -> 3(top-left) */}
    <line x1="17" y1="83" x2="17" y2="17" stroke="#a5d6a7" strokeWidth="0.5" />
    {/* 3(top-left) -> 4(bottom-right) */}
    <line x1="17" y1="17" x2="83" y2="83" stroke="#a5d6a7" strokeWidth="0.5" />
    {/* 4(bottom-right) -> 1(top-right) */}
    <line x1="83" y1="83" x2="83" y2="17" stroke="#a5d6a7" strokeWidth="0.5" />
  </Box>
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
