import { useState, useMemo } from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import type { TrainingRecord, TrainingType } from '@/types';
import { TRAINING_TYPE_LABELS } from '@/types';

interface ScoreChartProps {
  records: TrainingRecord[];
}

const CHART_HEIGHT = 180;
const CHART_PADDING = 32;

const filterOptions: Array<{ key: 'all' | TrainingType; label: string }> = [
  { key: 'all', label: 'すべて' },
  ...Object.entries(TRAINING_TYPE_LABELS).map(([key, label]) => ({
    key: key as TrainingType,
    label,
  })),
];

export const ScoreChart = ({ records }: ScoreChartProps) => {
  const [filter, setFilter] = useState<'all' | TrainingType>('all');

  const filtered = useMemo(() => {
    const sorted = [...records].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    if (filter === 'all') return sorted.slice(-30);
    return sorted.filter((r) => r.type === filter).slice(-30);
  }, [records, filter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.3 }}
    >
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          スコア推移
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {filterOptions.map((opt) => (
            <Chip
              key={opt.key}
              label={opt.label}
              size="small"
              onClick={() => setFilter(opt.key)}
              sx={{
                minHeight: 44,
                minWidth: 44,
                bgcolor: filter === opt.key ? 'primary.main' : 'transparent',
                color: filter === opt.key ? 'white' : 'text.secondary',
                border: filter === opt.key ? 'none' : '1px solid',
                borderColor: 'divider',
                fontWeight: filter === opt.key ? 700 : 400,
              }}
            />
          ))}
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              まだデータがないよ。トレーニングしてみよう！
            </Typography>
          </Box>
        ) : (
          <ChartSvg data={filtered} />
        )}
      </Paper>
    </motion.div>
  );
};

const ChartSvg = ({ data }: { data: TrainingRecord[] }) => {
  const maxScore = Math.max(...data.map((d) => d.score), 1);
  const width = 100;

  const points = data.map((d, i) => {
    const x = CHART_PADDING + ((width - CHART_PADDING * 2) / Math.max(data.length - 1, 1)) * i;
    const y = CHART_HEIGHT - CHART_PADDING - ((d.score / maxScore) * (CHART_HEIGHT - CHART_PADDING * 2));
    return { x, y, record: d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        width="100%"
        height={CHART_HEIGHT}
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = CHART_HEIGHT - CHART_PADDING - ratio * (CHART_HEIGHT - CHART_PADDING * 2);
          return (
            <line
              key={ratio}
              x1={CHART_PADDING}
              y1={y}
              x2={width - CHART_PADDING}
              y2={y}
              stroke="#E0E0E0"
              strokeWidth={0.3}
            />
          );
        })}

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#D4740E"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={1.5} fill="#D4740E" />
        ))}
      </svg>
    </Box>
  );
};
