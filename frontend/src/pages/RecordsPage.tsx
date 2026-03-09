import { Box, Typography, Paper, Grid } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import TimelineIcon from '@mui/icons-material/Timeline';
import StarIcon from '@mui/icons-material/Star';
import { useProgressStore } from '@/stores/useProgressStore';

export const RecordsPage = () => {
  const { totalPoints, currentLevel, totalTrainings } = useProgressStore();

  const stats = [
    { label: 'トレーニング回数', value: `${totalTrainings}回`, icon: <SchoolIcon /> },
    { label: '現在のレベル', value: `Lv.${currentLevel}`, icon: <StarIcon /> },
    { label: '累計ポイント', value: `${totalPoints}pt`, icon: <EmojiEventsIcon /> },
    { label: '平均正答率', value: '---', icon: <TimelineIcon /> },
  ];

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 3, textAlign: 'center' }}>
        きろく
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid key={stat.label} item xs={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ color: 'primary.main', mb: 1 }}>{stat.icon}</Box>
              <Typography variant="h3">{stat.value}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          トレーニングをすると、ここに記録が表示されるよ！
        </Typography>
      </Paper>
    </Box>
  );
};
