import { useState, useEffect, useRef, useCallback } from 'react';

const TRAINING_DURATION = 180;

interface UseTrainingTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
}

export const useTrainingTimer = (onTimeUp: () => void): UseTrainingTimerReturn => {
  const [timeLeft, setTimeLeft] = useState(TRAINING_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  return { timeLeft, isRunning, start, stop };
};
