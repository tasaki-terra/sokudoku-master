import { Box, Paper, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import type { TrainingRecord } from '@/types';

interface StatsSummaryProps {
  totalTrainings: number;
  currentLevel: number;
  totalPoints: number;
  records: TrainingRecord[];
}

const calcAverageRate = (records: TrainingRecord[]): string => {
  if (records.length === 0) return '---';
  const avg = records.reduce((sum, r) => sum + r.correctRate, 0) / records.length;
  return `${Math.round(avg)}%`;
};

export const StatsSummary = ({
  totalTrainings,
  currentLevel,
  totalPoints,
  records,
}: StatsSummaryProps) => {
  const stats = [
    { label: 'トレーニング回数', value: `${totalTrainings}回`, icon: <SchoolIcon />, color: '#D4740E' },
    { label: '現在のレベル', value: `Lv.${currentLevel}`, icon: <StarIcon />, color: '#FFB300' },
    { label: '累計ポイント', value: `${totalPoints}pt`, icon: <EmojiEventsIcon />, color: '#4CAF50' },
    { label: '平均正答率', value: calcAverageRate(records), icon: <CheckCircleIcon />, color: '#5C6BC0' },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 4,
      }}
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
        >
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              borderTop: `3px solid ${stat.color}`,
            }}
          >
            <Box sx={{ color: stat.color, mb: 0.5 }}>{stat.icon}</Box>
            <Typography variant="h3">{stat.value}</Typography>
            <Typography variant="body2" color="text.secondary">
              {stat.label}
            </Typography>
          </Paper>
        </motion.div>
      ))}
    </Box>
  );
};
