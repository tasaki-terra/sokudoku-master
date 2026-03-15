import { useCallback, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { TrainingHeader } from './TrainingHeader';
import { CountdownOverlay } from './CountdownOverlay';
import { TrainingLayout } from './TrainingBoard';
import { useTrainingTimer } from './useTrainingTimer';
import { useAutoAdvance, getLevelSpeed } from './useAutoAdvance';

interface ComplexTrainingProps {
  level: number;
  onComplete: () => void;
  onExit: () => void;
}

const P19_ROWS = 10;
const P19_COLS = 4;
const TOTAL_POSITIONS = 8;

/** P19 pattern: column tops and bottoms, right to left */
const P19_PATTERN: Array<{ row: number; col: number; num: number }> = [
  { row: 0, col: 3, num: 1 },
  { row: 9, col: 3, num: 2 },
  { row: 0, col: 2, num: 3 },
  { row: 9, col: 2, num: 4 },
  { row: 0, col: 1, num: 5 },
  { row: 9, col: 1, num: 6 },
  { row: 0, col: 0, num: 7 },
  { row: 9, col: 0, num: 8 },
];

export const ComplexTraining = ({ level, onComplete, onExit }: ComplexTrainingProps) => {
  const [phase, setPhase] = useState<'countdown' | 'training'>('countdown');
  const speed = getLevelSpeed(level);

  const { timeLeft, start, stop } = useTrainingTimer(onComplete);

  const handleCycleComplete = useCallback(() => {
    stop();
    onComplete();
  }, [stop, onComplete]);

  const { currentPosition } = useAutoAdvance(
    TOTAL_POSITIONS, speed, phase === 'training', handleCycleComplete,
  );

  const handleCountdownComplete = useCallback(() => {
    setPhase('training');
    start();
  }, [start]);

  const speedText = level === 6 ? '同時表示' : `${speed / 1000}秒間隔`;
  const activeP19 = P19_PATTERN[currentPosition % TOTAL_POSITIONS];

  return (
    <>
      {phase === 'countdown' && (
        <CountdownOverlay
          title="複合移動トレーニング"
          instruction="濃くなっている○印を目で追いかけてね！"
          characters="👀🔀🦁"
          onComplete={handleCountdownComplete}
        />
      )}
      <TrainingHeader
        title="FT1表 複合移動トレーニング（訓練手帳P18-19）"
        timeLeft={timeLeft}
        onExit={onExit}
      />
      <TrainingLayout>
        <Box
          sx={{
            width: '100%',
            maxWidth: 1200,
            height: 700,
            bgcolor: 'white',
            border: '3px solid #2e7d32',
            borderRadius: '8px',
            p: '30px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 20,
              fontSize: 14,
              color: '#999999',
            }}
          >
            {`レベル${level}: ${speedText} / 複合パターン移動`}
          </Box>

          <Box sx={{ display: 'flex', width: '100%', height: '100%', gap: '40px' }}>
            {/* P19 left area */}
            <P19Area activeRow={activeP19.row} activeCol={activeP19.col} />

            {/* P18 right area */}
            <P18Area />
          </Box>
        </Box>
      </TrainingLayout>
    </>
  );
};

/** P19 grid area with 4x10 circles */
const P19Area = ({ activeRow, activeCol }: { activeRow: number; activeCol: number }) => (
  <Box sx={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Typography sx={{ position: 'absolute', top: -20, right: 10, fontSize: 24, fontWeight: 'bold' }}>
      19
    </Typography>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${P19_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${P19_ROWS}, 1fr)`,
        gap: '15px',
        width: '100%',
        height: '85%',
        mt: '40px',
      }}
    >
      {Array.from({ length: P19_ROWS * P19_COLS }, (_, i) => {
        const row = Math.floor(i / P19_COLS);
        const col = i % P19_COLS;
        const isActive = row === activeRow && col === activeCol;
        const patternData = P19_PATTERN.find((p) => p.row === row && p.col === col);
        return (
          <Box
            key={i}
            sx={{
              width: 40,
              height: 40,
              border: `${isActive ? 4 : 2}px solid #2e7d32`,
              borderRadius: '50%',
              bgcolor: 'white',
              margin: 'auto',
              opacity: isActive ? 1 : 0.3,
              transition: 'opacity 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {patternData && (
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#333333',
                }}
              >
                {patternData.num}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
    {/* Vertical guide lines */}
    {[25, 50, 75].map((left) => (
      <Box
        key={left}
        sx={{
          position: 'absolute',
          width: 0,
          height: 'calc(100% - 100px)',
          borderLeft: '2px dashed #a5d6a7',
          top: 50,
          left: `${left}%`,
        }}
      />
    ))}
  </Box>
);

const P18_SYMS_PER_COL = 10;

/** P18 area with 4 vertical columns */
const P18Area = () => (
  <Box sx={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Typography sx={{ position: 'absolute', top: -20, right: 10, fontSize: 24, fontWeight: 'bold' }}>
      18
    </Typography>
    <Box sx={{ display: 'flex', width: '100%', height: '90%', mt: '30px' }}>
      {Array.from({ length: 4 }, (_, colIdx) => (
        <Box
          key={colIdx}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {Array.from({ length: P18_SYMS_PER_COL }, (_, symIdx) => {
            const isStart = colIdx === 3 && symIdx === 0;
            const isEnd = colIdx === 0 && symIdx === P18_SYMS_PER_COL - 1;
            const size = isStart || isEnd ? 40 : 30;
            return (
              <Box key={symIdx}>
                <Box
                  sx={{
                    width: size,
                    height: size,
                    border: `${isStart || isEnd ? 3 : 2}px solid #2e7d32`,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    opacity: isStart || isEnd ? 1 : 0.2,
                    flexShrink: 0,
                  }}
                />
                {symIdx < P18_SYMS_PER_COL - 1 && <P18Arrow />}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
    {/* Column separators */}
    {[25, 50, 75].map((left) => (
      <Box
        key={left}
        sx={{
          position: 'absolute',
          width: 0,
          height: 'calc(85% - 50px)',
          borderLeft: '2px dashed #000000',
          top: 70,
          left: `${left}%`,
        }}
      />
    ))}
  </Box>
);

const P18Arrow = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0,
      flexShrink: 0,
      '&::before': {
        content: '""',
        display: 'block',
        width: 1,
        height: 6,
        bgcolor: '#a5d6a7',
      },
      '&::after': {
        content: '""',
        display: 'block',
        width: 0,
        height: 0,
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderTop: '5px solid #a5d6a7',
      },
    }}
  />
);
