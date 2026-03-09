import { Box } from '@mui/material';
import type { ReactNode } from 'react';

interface TrainingBoardProps {
  children: ReactNode;
  maxWidth?: number;
  height?: number | string;
  info?: string;
}

export const TrainingBoard = ({ children, maxWidth = 900, height, info }: TrainingBoardProps) => (
  <Box
    sx={{
      width: '100%',
      maxWidth,
      bgcolor: 'white',
      border: '2px solid #2e7d32',
      borderRadius: '8px',
      p: '40px 20px',
      position: 'relative',
      ...(height ? { height, display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}),
    }}
  >
    {info && (
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 20,
          fontSize: 14,
          color: '#999999',
        }}
      >
        {info}
      </Box>
    )}
    {children}
  </Box>
);

interface TrainingLayoutProps {
  children: ReactNode;
  hasBottomBar?: boolean;
}

export const TrainingLayout = ({ children, hasBottomBar = false }: TrainingLayoutProps) => (
  <Box
    sx={{
      minHeight: '100vh',
      bgcolor: '#e0f2e0',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pt: '70px',
        pb: hasBottomBar ? '100px' : '20px',
        px: '20px',
      }}
    >
      {children}
    </Box>
  </Box>
);
