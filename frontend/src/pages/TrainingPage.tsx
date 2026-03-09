import { Box, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FastForwardIcon from '@mui/icons-material/FastForward';
import type { TrainingType } from '@/types';
import { TRAINING_TYPE_LABELS } from '@/types';
import { useProgressStore } from '@/stores/useProgressStore';

const TRAINING_CARDS: { type: TrainingType; icon: React.ReactNode; description: string }[] = [
  { type: 'horizontal', icon: <SwapHorizIcon fontSize="large" />, description: '左右に視線を素早く動かす' },
  { type: 'vertical', icon: <SwapVertIcon fontSize="large" />, description: '上下に視線を素早く動かす' },
  { type: 'diagonal', icon: <OpenWithIcon fontSize="large" />, description: 'X字型に視線を動かす' },
  { type: 'complex', icon: <ShuffleIcon fontSize="large" />, description: '垂直＋斜めの複合パターン' },
  { type: 'sequence', icon: <FormatListNumberedIcon fontSize="large" />, description: '数字を順番に追いかける' },
  { type: 'continuous', icon: <FastForwardIcon fontSize="large" />, description: '連続して水平に視線を動かす' },
];

export const TrainingPage = () => {
  const { bestScores } = useProgressStore();

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 3, textAlign: 'center' }}>
        トレーニングを選ぼう！
      </Typography>
      <Grid container spacing={2}>
        {TRAINING_CARDS.map((card) => (
          <Grid key={card.type} item xs={12} sm={6} md={4}>
            <Card>
              <CardActionArea sx={{ p: 2, minHeight: 160 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 1 }}>{card.icon}</Box>
                  <Typography variant="h4" gutterBottom>
                    {TRAINING_TYPE_LABELS[card.type]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                  {bestScores[card.type] > 0 && (
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', mt: 1, color: 'primary.main', fontWeight: 700 }}
                    >
                      最高スコア: {bestScores[card.type]}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
