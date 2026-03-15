import { Box, Typography, Button, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import ReplayIcon from '@mui/icons-material/Replay';
import HistoryIcon from '@mui/icons-material/History';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useNavigate } from 'react-router-dom';
import type { TrainingType } from '@/types';
import { useBestScores } from '@/hooks/useProgress';

interface TrainingResultProps {
  score: number;
  earnedPoints: number;
  type: TrainingType;
  onRetry: () => void;
}

export const TrainingResult = ({
  score,
  earnedPoints,
  type,
  onRetry,
}: TrainingResultProps) => {
  const navigate = useNavigate();
  const { data: bestScores } = useBestScores();
  const previousBest = bestScores?.[type] ?? 0;
  const diff = score - previousBest;

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h2" sx={{ mb: 3 }}>
        けっか
      </Typography>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h1" sx={{ fontSize: '3rem', color: 'primary.main', mb: 1 }}>
            {score}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            スコア
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h3">+{earnedPoints}pt</Typography>
              <Typography variant="body2" color="text.secondary">獲得ポイント</Typography>
            </Box>
          </Box>

          {previousBest > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              {diff > 0 ? (
                <ArrowUpwardIcon sx={{ color: 'success.main' }} />
              ) : diff < 0 ? (
                <ArrowDownwardIcon sx={{ color: 'error.main' }} />
              ) : null}
              <Typography
                variant="body2"
                sx={{ color: diff > 0 ? 'success.main' : diff < 0 ? 'error.main' : 'text.secondary' }}
              >
                {diff > 0 ? `+${diff}` : diff === 0 ? '前回と同じ' : `${diff}`}
                {diff !== 0 && ' (前回比)'}
              </Typography>
            </Box>
          )}
        </Paper>
      </motion.div>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<ReplayIcon />}
          onClick={onRetry}
          sx={{ minHeight: 48, minWidth: 140 }}
        >
          もう一度
        </Button>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={() => navigate('/records')}
          sx={{ minHeight: 48, minWidth: 140 }}
        >
          記録を見る
        </Button>
      </Box>
    </Box>
  );
};
