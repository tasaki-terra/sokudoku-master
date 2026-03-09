import { AppBar, Toolbar, Typography, Box, Chip, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import { config } from '@/config';
import { useProgressStore } from '@/stores/useProgressStore';

const NAV_ITEMS = [
  { label: 'トレーニング', path: '/' },
  { label: '記録', path: '/records' },
] as const;

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalPoints, currentLevel } = useProgressStore();

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'linear-gradient(135deg, #D4740E 0%, #A85A00 100%)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            cursor: 'pointer',
            color: 'white',
            whiteSpace: 'nowrap',
          }}
          onClick={() => navigate('/')}
        >
          {config.appName}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                color: 'white',
                fontWeight: location.pathname === item.path ? 700 : 400,
                borderBottom: location.pathname === item.path
                  ? '2px solid white'
                  : '2px solid transparent',
                borderRadius: 0,
                minHeight: 44,
                minWidth: 44,
                px: 2,
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<StarIcon sx={{ color: '#FFD700 !important' }} />}
            label={`Lv.${currentLevel}`}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 700,
            }}
          />
          <Chip
            icon={<EmojiEventsIcon sx={{ color: '#FFD700 !important' }} />}
            label={`${totalPoints}pt`}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 700,
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
