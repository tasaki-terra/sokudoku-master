import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import { useRecordStats } from '@/hooks/useProgress';

export const StatsSummary = () => {
  const { data, isLoading } = useRecordStats();

  if (isLoading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  const averageRate = data.averageCorrectRate != null
    ? `${Math.round(data.averageCorrectRate)}%`
    : '---';

  const stats = [
    { label: 'トレーニング回数', value: `${data.totalTrainings}回`, icon: <SchoolIcon />, color: '#D4740E' },
    { label: '現在のレベル', value: `Lv.${data.currentLevel}`, icon: <StarIcon />, color: '#FFB300' },
    { label: '累計ポイント', value: `${data.totalPoints}pt`, icon: <EmojiEventsIcon />, color: '#4CAF50' },
    { label: '平均正答率', value: averageRate, icon: <CheckCircleIcon />, color: '#5C6BC0' },
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
