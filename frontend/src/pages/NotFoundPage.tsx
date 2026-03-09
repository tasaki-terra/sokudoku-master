import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: 2,
      }}
    >
      <Typography variant="h1" sx={{ fontSize: '4rem', color: 'primary.main' }}>
        404
      </Typography>
      <Typography variant="h3">ページが見つかりません</Typography>
      <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
        トレーニングに戻る
      </Button>
    </Box>
  );
};
