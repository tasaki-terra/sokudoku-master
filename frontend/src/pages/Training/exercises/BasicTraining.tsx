import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Button } from '@mui/material';
import { TrainingHeader } from './TrainingHeader';
import { CountdownOverlay } from './CountdownOverlay';
import { TrainingBoard } from './TrainingBoard';
import { TrainingLayout } from './TrainingBoard';
import { useTrainingTimer } from './useTrainingTimer';

interface BasicTrainingProps {
  level: number;
  onComplete: () => void;
  onExit: () => void;
}

const SYMBOLS_PER_ROW = 7;
const TOTAL_SYMBOLS = 14;

/** Division patterns for 4-division and 8-division */
const DIVISION_COUNTS = { 1: 5, 2: 9 };

const getDivisionCount = (level: number): number =>
  level >= 2 ? DIVISION_COUNTS[2] : DIVISION_COUNTS[1];

export const BasicTraining = ({ level, onComplete, onExit }: BasicTrainingProps) => {
  const [phase, setPhase] = useState<'countdown' | 'training'>('countdown');
  const [currentSymbol, setCurrentSymbol] = useState(0);
  const [currentDivision, setCurrentDivision] = useState(0);
  const cycleCalledRef = useRef(false);

  const { timeLeft, start, stop } = useTrainingTimer(onComplete);

  const handleCountdownComplete = useCallback(() => {
    setPhase('training');
    start();
  }, [start]);

  const divisionsPerSymbol = getDivisionCount(level);

  const handleConfirm = useCallback(() => {
    setCurrentDivision((prev) => {
      const next = prev + 1;
      if (next >= divisionsPerSymbol) {
        setCurrentSymbol((s) => {
          const nextS = (s + 1) % TOTAL_SYMBOLS;
          if (nextS === 0 && !cycleCalledRef.current) {
            cycleCalledRef.current = true;
            stop();
            setTimeout(() => onComplete(), 0);
          }
          return nextS;
        });
        return 0;
      }
      return next;
    });
  }, [divisionsPerSymbol, stop, onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'training') return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleConfirm]);

  const renderRow = (startIndex: number) => {
    const symbols = [];
    for (let i = 0; i < SYMBOLS_PER_ROW; i++) {
      const symbolIndex = startIndex + i;
      const isActive = symbolIndex === currentSymbol;
      symbols.push(
        <Box
          key={`sym-${symbolIndex}`}
          sx={{
            width: 50,
            height: 50,
            border: '2px solid #2e7d32',
            borderRadius: '50%',
            bgcolor: 'white',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {isActive && (
            <Box
              sx={{
                position: 'absolute',
                width: 4,
                height: 4,
                bgcolor: '#FF0000',
                borderRadius: '50%',
                top: '50%',
                left: `${getFocusOffset(currentDivision, divisionsPerSymbol)}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 4px rgba(255, 0, 0, 0.5)',
                zIndex: 10,
                transition: 'left 0.3s ease',
              }}
            />
          )}
        </Box>,
      );
      if (i < SYMBOLS_PER_ROW - 1) {
        symbols.push(<Arrow key={`arrow-${symbolIndex}`} />);
      }
    }
    return symbols;
  };

  return (
    <>
      {phase === 'countdown' && (
        <CountdownOverlay
          title="基本訓練"
          instruction="○印に表示される赤い点を<br>しっかりと見れたら、確認ボタンを押して次の場所を見てね！"
          characters="🦊📚🐯"
          onComplete={handleCountdownComplete}
        />
      )}
      <TrainingHeader title="基本訓練" timeLeft={timeLeft} onExit={onExit} />
      <TrainingLayout hasBottomBar>
        <TrainingBoard maxWidth={1200} info={`レベル${level}: ${level >= 2 ? '8' : '4'}分割`}>
          <Box sx={{ display: 'flex', alignItems: 'center', my: '40px', gap: 0 }}>
            {renderRow(0)}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', my: '40px', gap: 0 }}>
            {renderRow(SYMBOLS_PER_ROW)}
          </Box>
          <ProgressDots total={TOTAL_SYMBOLS} current={currentSymbol} />
        </TrainingBoard>
      </TrainingLayout>
      <ConfirmBar onConfirm={handleConfirm} />
    </>
  );
};

/** Calculate focus point horizontal offset as percentage */
const getFocusOffset = (division: number, total: number): number => {
  const step = 100 / (total - 1);
  return division * step;
};

const Arrow = () => (
  <Box
    sx={{
      width: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      flexShrink: 0,
      height: 50,
      '&::before': {
        content: '""',
        position: 'absolute',
        width: 27,
        height: 2,
        bgcolor: '#2e7d32',
        top: '50%',
        left: 9,
        transform: 'translateY(-50%)',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: 0,
        height: 0,
        borderLeft: '8px solid #2e7d32',
        borderTop: '5px solid transparent',
        borderBottom: '5px solid transparent',
        top: '50%',
        right: 6,
        transform: 'translateY(-50%)',
      },
    }}
  />
);

const ConfirmBar = ({ onConfirm }: { onConfirm: () => void }) => (
  <Box
    sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 80,
      bgcolor: '#f5f5f5',
      borderTop: '1px solid #e0e0e0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    }}
  >
    <Button
      onClick={onConfirm}
      sx={{
        bgcolor: '#000000',
        color: 'white',
        px: '60px',
        py: '15px',
        fontSize: 18,
        fontWeight: 500,
        borderRadius: '30px',
        minHeight: 48,
        minWidth: 44,
        '&:hover': { bgcolor: '#333333', transform: 'translateY(-1px)' },
        '&:active': { transform: 'translateY(0)' },
      }}
    >
      確認
    </Button>
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
