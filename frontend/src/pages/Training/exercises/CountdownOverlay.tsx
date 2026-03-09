import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography } from '@mui/material';

interface CountdownOverlayProps {
  title: string;
  instruction: string;
  characters: string;
  onComplete: () => void;
}

export const CountdownOverlay = ({
  title,
  instruction,
  characters,
  onComplete,
}: CountdownOverlayProps) => {
  const [count, setCount] = useState(5);
  const [visible, setVisible] = useState(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const handleCountdown = useCallback(() => {
    setCount((prev) => {
      if (prev <= 1) {
        setVisible(false);
        setTimeout(() => onCompleteRef.current(), 500);
        return 0;
      }
      return prev - 1;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(handleCountdown, 1000);
    return () => clearInterval(timer);
  }, [handleCountdown]);

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #fff9c4 0%, #c8e6c9 50%, #bbdefb 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
    >
      <Box sx={{ textAlign: 'center', position: 'relative' }}>
        <Typography sx={{ fontSize: 50, mb: '15px', animation: 'bounce 1s ease-in-out infinite alternate' }}>
          {characters}
        </Typography>
        <Typography
          sx={{
            fontSize: 36,
            mb: '20px',
            color: '#2e7d32',
            fontWeight: 'bold',
            textShadow: '2px 2px 0px rgba(0,0,0,0.08)',
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: 18,
            color: '#333333',
            mb: '20px',
            lineHeight: 1.8,
            bgcolor: 'rgba(255, 255, 255, 0.75)',
            px: '30px',
            py: '15px',
            borderRadius: '20px',
            display: 'inline-block',
          }}
          dangerouslySetInnerHTML={{ __html: instruction }}
        />
        {count > 0 && (
          <Typography
            sx={{
              fontSize: 80,
              fontWeight: 'bold',
              color: '#e53935',
              mt: '10px',
              textShadow: '3px 3px 0px rgba(0,0,0,0.12)',
              animation: 'pulse 1s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
              },
              '@keyframes bounce': {
                from: { transform: 'translateY(0)' },
                to: { transform: 'translateY(-12px)' },
              },
            }}
          >
            {count}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
