import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import type { TrainingRecord } from '@/types';
import { TRAINING_TYPE_LABELS } from '@/types';

interface TrainingHistoryProps {
  records: TrainingRecord[];
}

const PAGE_SIZE = 10;

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export const TrainingHistory = ({ records }: TrainingHistoryProps) => {
  const [page, setPage] = useState(0);

  const sorted = [...records].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const displayed = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h4">トレーニング履歴</Typography>
        </Box>

        {sorted.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              トレーニングをすると、ここに記録が表示されるよ！
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>日付</TableCell>
                    <TableCell>種類</TableCell>
                    <TableCell align="center">Lv</TableCell>
                    <TableCell align="right">スコア</TableCell>
                    <TableCell align="right">正答率</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayed.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.createdAt)}</TableCell>
                      <TableCell>{TRAINING_TYPE_LABELS[record.type]}</TableCell>
                      <TableCell align="center">{record.level}</TableCell>
                      <TableCell align="right">{record.score}</TableCell>
                      <TableCell align="right">{Math.round(record.correctRate)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, p: 2 }}>
                <Button
                  size="small"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  sx={{ minHeight: 44, minWidth: 44 }}
                >
                  前へ
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {page + 1} / {totalPages}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  sx={{ minHeight: 44, minWidth: 44 }}
                >
                  次へ
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>
    </motion.div>
  );
};
