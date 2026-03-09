import { Box } from '@mui/material';

interface CircleSymbolProps {
  active?: boolean;
  size?: number;
  children?: React.ReactNode;
}

export const CircleSymbol = ({ active = false, size = 50, children }: CircleSymbolProps) => (
  <Box
    sx={{
      width: size,
      height: size,
      minWidth: 44,
      minHeight: 44,
      border: `${active ? 4 : 2}px solid #2e7d32`,
      borderRadius: '50%',
      bgcolor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      opacity: active ? 1 : 0.3,
      transition: 'opacity 0.3s ease',
      position: 'relative',
    }}
  >
    {children}
  </Box>
);
