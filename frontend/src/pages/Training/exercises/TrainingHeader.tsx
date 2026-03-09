import { Box, Typography, Button } from '@mui/material';

interface TrainingHeaderProps {
  title: string;
  timeLeft: number;
  onExit: () => void;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const TrainingHeader = ({ title, timeLeft, onExit }: TrainingHeaderProps) => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 50,
      bgcolor: '#000000',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: '20px',
      zIndex: 100,
    }}
  >
    <Button
      onClick={onExit}
      sx={{
        bgcolor: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.4)',
        color: 'white',
        borderRadius: '20px',
        px: 2,
        py: 0.5,
        fontSize: 14,
        fontWeight: 500,
        minWidth: 44,
        minHeight: 44,
        '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
      }}
    >
      終了
    </Button>
    <Typography sx={{ fontSize: 16, fontWeight: 500 }}>{title}</Typography>
    <Typography sx={{ fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' }}>
      {formatTime(timeLeft)}
    </Typography>
  </Box>
);
