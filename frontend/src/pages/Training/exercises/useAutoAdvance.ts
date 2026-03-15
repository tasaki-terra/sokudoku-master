import { useEffect, useRef, useCallback, useState } from 'react';

/** Level-based speed in ms */
export const getLevelSpeed = (level: number): number => {
  const speeds: Record<number, number> = {
    1: 2000,
    2: 1000,
    3: 500,
    4: 250,
    5: 100,
    6: 0,
  };
  return speeds[level] ?? 1000;
};

interface UseAutoAdvanceReturn {
  currentPosition: number;
  advance: () => void;
  reset: () => void;
}

export const useAutoAdvance = (
  totalPositions: number,
  speed: number,
  isRunning: boolean,
  onCycleComplete?: () => void,
): UseAutoAdvanceReturn => {
  const [currentPosition, setCurrentPosition] = useState(0);
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastAdvanceRef = useRef(0);
  const onCycleCompleteRef = useRef(onCycleComplete);
  onCycleCompleteRef.current = onCycleComplete;
  const cycleCalledRef = useRef(false);

  const advance = useCallback(() => {
    setCurrentPosition((prev) => {
      const next = (prev + 1) % totalPositions;
      if (next === 0 && !cycleCalledRef.current) {
        cycleCalledRef.current = true;
        setTimeout(() => onCycleCompleteRef.current?.(), 0);
      }
      return next;
    });
  }, [totalPositions]);

  const reset = useCallback(() => {
    setCurrentPosition(0);
    startTimeRef.current = 0;
    lastAdvanceRef.current = 0;
    cycleCalledRef.current = false;
  }, []);

  useEffect(() => {
    if (!isRunning || speed <= 0) return;

    const tick = (timestamp: number) => {
      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp;
        lastAdvanceRef.current = timestamp;
      }

      const elapsed = timestamp - lastAdvanceRef.current;
      if (elapsed >= speed) {
        lastAdvanceRef.current = timestamp;
        advance();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, speed, advance]);

  return { currentPosition, advance, reset };
};
