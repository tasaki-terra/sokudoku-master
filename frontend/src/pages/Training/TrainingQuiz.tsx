import { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import type { QuizQuestion } from './trainingLogic';

interface TrainingQuizProps {
  questions: QuizQuestion[];
  onComplete: (answers: boolean[]) => void;
}

export const TrainingQuiz = ({ questions, onComplete }: TrainingQuizProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const question = questions[currentIndex];

  const handleAnswer = (optionIndex: number) => {
    if (selected !== null) return;
    setSelected(optionIndex);

    const isCorrect = optionIndex === question.correctIndex;
    const newAnswers = [...answers, isCorrect];

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setAnswers(newAnswers);
        setCurrentIndex(currentIndex + 1);
        setSelected(null);
      } else {
        onComplete(newAnswers);
      }
    }, 800);
  };

  const getButtonColor = (index: number) => {
    if (selected === null) return 'inherit';
    if (index === question.correctIndex) return 'success.light';
    if (index === selected) return 'error.light';
    return 'inherit';
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        クイズ
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {currentIndex + 1} / {questions.length}
      </Typography>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            {question.question}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="outlined"
                onClick={() => handleAnswer(index)}
                disabled={selected !== null}
                sx={{
                  minHeight: 48,
                  fontSize: '1.1rem',
                  backgroundColor: getButtonColor(index),
                  '&:disabled': {
                    backgroundColor: getButtonColor(index),
                    borderColor: 'divider',
                  },
                }}
              >
                {option}
              </Button>
            ))}
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};
