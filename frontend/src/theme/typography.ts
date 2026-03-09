import type { TypographyOptions } from '@mui/material/styles/createTypography';

const FONT_FAMILY = [
  '"Noto Sans JP"',
  '"Rounded Mplus 1c"',
  'sans-serif',
].join(',');

export const typography: TypographyOptions = {
  fontFamily: FONT_FAMILY,
  h1: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  h2: {
    fontSize: '1.5rem',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
  button: {
    fontWeight: 600,
    textTransform: 'none',
  },
};
