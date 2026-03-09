import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useProgressStore } from '@/stores/useProgressStore';
import type { TrainingRecord } from '@/types';
import { StatsSummary } from './Records/StatsSummary';
import { ScoreChart } from './Records/ScoreChart';
import { TrainingHistory } from './Records/TrainingHistory';

const STORAGE_KEY = 'sokudoku-records';

const loadRecords = (): TrainingRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TrainingRecord[];
  } catch {
    return [];
  }
};

export const RecordsPage = () => {
  const { totalPoints, currentLevel, totalTrainings } = useProgressStore();
  const records = useMemo(loadRecords, []);

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 3, textAlign: 'center' }}>
        きろく
      </Typography>

      <StatsSummary
        totalTrainings={totalTrainings}
        currentLevel={currentLevel}
        totalPoints={totalPoints}
        records={records}
      />

      <ScoreChart records={records} />

      <TrainingHistory records={records} />
    </Box>
  );
};
