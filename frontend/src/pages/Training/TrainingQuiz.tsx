import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import type { QuizAnswer } from '@/types';

/** Special symbols used in training grids */
const ALL_SPECIAL_SYMBOLS = ['★', '♦', '♥', '♣'];

export interface QuizQuestionData {
  question: string;
  options: string[];
  correctIndex: number;
}

interface TrainingQuizProps {
  specialSymbols: string[];
  onComplete: (answers: QuizAnswer[]) => void;
}

const FEEDBACK_DELAY = 800;

function generateQuestions(symbols: string[]): QuizQuestionData[] {
  const questions: QuizQuestionData[] = [];
  const count = Math.min(symbols.length, 4);
  const used = symbols.slice(0, count);

  for (let i = 0; i < used.length; i++) {
    const correct = used[i];
    const distractors = ALL_SPECIAL_SYMBOLS.filter((s) => s !== correct);
    shuffleArray(distractors);
    const options = [correct, ...distractors.slice(0, 3)];
    shuffleArray(options);

    questions.push({
      question: `${i + 1}番目に見つけた特殊記号はどれ？`,
      options,
      correctIndex: options.indexOf(correct),
    });
  }

  return questions;
}

function shuffleArray<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export const TrainingQuiz = ({ specialSymbols, onComplete }: TrainingQuizProps) => {
  const [questions] = useState(() => generateQuestions(specialSymbols));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const totalQuestions = questions.length;
  const current = questions[currentIndex];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (isRevealed || selectedIndex !== null) return;

      setSelectedIndex(optionIndex);
      setIsRevealed(true);

      const isCorrect = optionIndex === current.correctIndex;
      const answer: QuizAnswer = {
        questionIndex: currentIndex,
        selectedOption: optionIndex,
        correctOption: current.correctIndex,
        isCorrect,
      };

      const newAnswers = [...answers, answer];
      setAnswers(newAnswers);

      timerRef.current = setTimeout(() => {
        if (currentIndex + 1 >= totalQuestions) {
          onComplete(newAnswers);
        } else {
          setCurrentIndex((prev) => prev + 1);
          setSelectedIndex(null);
          setIsRevealed(false);
        }
      }, FEEDBACK_DELAY);
    },
    [isRevealed, selectedIndex, current, currentIndex, answers, totalQuestions, onComplete],
  );

  if (!current) return null;

  return (
    <Box sx={{ textAlign: 'center', px: 2, py: 4, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h4" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
        クイズ
      </Typography>

      <Typography sx={{ mb: 3, fontSize: 18, color: 'text.secondary' }}>
        {currentIndex + 1} / {totalQuestions}
      </Typography>

      <Typography sx={{ mb: 4, fontSize: 20 }}>
        {current.question}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {current.options.map((option, idx) => {
          const isCorrectOption = idx === current.correctIndex;
          const isSelected = idx === selectedIndex;

          let bgcolor = 'white';
          let borderColor = '#2e7d32';
          if (isRevealed) {
            if (isCorrectOption) {
              bgcolor = '#4caf50';
              borderColor = '#388e3c';
            } else if (isSelected) {
              bgcolor = '#f44336';
              borderColor = '#d32f2f';
            }
          }

          return (
            <Button
              key={idx}
              variant="outlined"
              disabled={isRevealed}
              onClick={() => handleSelect(idx)}
              sx={{
                minHeight: 56,
                minWidth: 44,
                fontSize: 28,
                fontWeight: 'bold',
                bgcolor,
                borderColor,
                color: isRevealed && (isCorrectOption || isSelected) ? 'white' : 'text.primary',
                '&:hover': { bgcolor: isRevealed ? bgcolor : '#e8f5e9' },
                '&.Mui-disabled': {
                  bgcolor,
                  borderColor,
                  color: isRevealed && (isCorrectOption || isSelected) ? 'white' : 'text.disabled',
                },
              }}
            >
              {option}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};
