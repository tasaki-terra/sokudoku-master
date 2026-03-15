import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useTrainingRecords } from '@/hooks/useRecords';
import { StatsSummary } from './Records/StatsSummary';
import { ScoreChart } from './Records/ScoreChart';
import { TrainingHistory } from './Records/TrainingHistory';

export const RecordsPage = () => {
  const { data, isLoading, error } = useTrainingRecords();
  const records = data?.records ?? [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ px: 2, py: 4 }}>
        <Alert severity="error">記録の読み込みに失敗しました</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 3, textAlign: 'center' }}>
        きろく
      </Typography>

      <StatsSummary />

      <ScoreChart records={records} />

      <TrainingHistory records={records} />
    </Box>
  );
};
