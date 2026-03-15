import { startTrainingSchema, saveTrainingResultSchema } from '../../../src/schemas/training';

describe('startTrainingSchema', () => {
  it('正常: { type: "horizontal", level: 1 } でバリデーション成功', () => {
    const result = startTrainingSchema.safeParse({ type: 'horizontal', level: 1 });
    expect(result.success).toBe(true);
  });

  it.each([
    'horizontal',
    'vertical',
    'diagonal',
    'complex',
    'sequence',
    'continuous',
  ] as const)('正常: type="%s" でバリデーション成功', (type) => {
    const result = startTrainingSchema.safeParse({ type, level: 3 });
    expect(result.success).toBe(true);
  });

  it.each([1, 2, 3, 4, 5, 6])('正常: level=%i（境界値）でバリデーション成功', (level) => {
    const result = startTrainingSchema.safeParse({ type: 'horizontal', level });
    expect(result.success).toBe(true);
  });

  it('異常: 無効なtype "invalid" でバリデーション失敗', () => {
    const result = startTrainingSchema.safeParse({ type: 'invalid', level: 1 });
    expect(result.success).toBe(false);
  });

  it('異常: level=0（下限未満）でバリデーション失敗', () => {
    const result = startTrainingSchema.safeParse({ type: 'horizontal', level: 0 });
    expect(result.success).toBe(false);
  });

  it('異常: level=7（上限超過）でバリデーション失敗', () => {
    const result = startTrainingSchema.safeParse({ type: 'horizontal', level: 7 });
    expect(result.success).toBe(false);
  });

  it('異常: level=2.5（小数）でバリデーション失敗', () => {
    const result = startTrainingSchema.safeParse({ type: 'horizontal', level: 2.5 });
    expect(result.success).toBe(false);
  });

  it('異常: type欠落でバリデーション失敗', () => {
    const result = startTrainingSchema.safeParse({ level: 1 });
    expect(result.success).toBe(false);
  });

  it('異常: level欠落でバリデーション失敗', () => {
    const result = startTrainingSchema.safeParse({ type: 'horizontal' });
    expect(result.success).toBe(false);
  });

  it('異常: 空オブジェクトでバリデーション失敗', () => {
    const result = startTrainingSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('saveTrainingResultSchema', () => {
  const validData = {
    sessionId: 'session-123',
    type: 'horizontal' as const,
    level: 3,
    score: 85,
    correctRate: 90.5,
    earnedPoints: 100,
    quizAnswers: [
      {
        questionIndex: 0,
        selectedOption: 2,
        correctOption: 2,
        isCorrect: true,
      },
      {
        questionIndex: 1,
        selectedOption: 1,
        correctOption: 3,
        isCorrect: false,
      },
    ],
  };

  it('正常: 全フィールド正常でバリデーション成功', () => {
    const result = saveTrainingResultSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('正常: quizAnswers空配列でバリデーション成功', () => {
    const result = saveTrainingResultSchema.safeParse({
      ...validData,
      quizAnswers: [],
    });
    expect(result.success).toBe(true);
  });

  it('正常: correctRate=0（下限）でバリデーション成功', () => {
    const result = saveTrainingResultSchema.safeParse({
      ...validData,
      correctRate: 0,
    });
    expect(result.success).toBe(true);
  });

  it('正常: correctRate=100（上限）でバリデーション成功', () => {
    const result = saveTrainingResultSchema.safeParse({
      ...validData,
      correctRate: 100,
    });
    expect(result.success).toBe(true);
  });

  it('異常: sessionId空文字でバリデーション失敗', () => {
    const result = saveTrainingResultSchema.safeParse({
      ...validData,
      sessionId: '',
    });
    expect(result.success).toBe(false);
  });

  it('異常: score=-1（負数）でバリデーション失敗', () => {
    const result = saveTrainingResultSchema.safeParse({
      ...validData,
      score: -1,
    });
    expect(result.success).toBe(false);
  });

  it('異常: correctRate=101（上限超過）でバリデーション失敗', () => {
    const result = saveTrainingResultSchema.safeParse({
      ...validData,
      correctRate: 101,
    });
    expect(result.success).toBe(false);
  });

  it('異常: correctRate=-1（下限未満）でバリデーション失敗', () => {
    const result = saveTrainingResultSchema.safeParse({
      ...validData,
      correctRate: -1,
    });
    expect(result.success).toBe(false);
  });

  it('異常: quizAnswers構造不正（isCorrect欠落）でバリデーション失敗', () => {
    const result = saveTrainingResultSchema.safeParse({
      ...validData,
      quizAnswers: [
        {
          questionIndex: 0,
          selectedOption: 2,
          correctOption: 2,
          // isCorrect missing
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('異常: quizAnswers構造不正（questionIndexが負数）でバリデーション失敗', () => {
    const result = saveTrainingResultSchema.safeParse({
      ...validData,
      quizAnswers: [
        {
          questionIndex: -1,
          selectedOption: 0,
          correctOption: 0,
          isCorrect: true,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('異常: quizAnswersが配列でないでバリデーション失敗', () => {
    const result = saveTrainingResultSchema.safeParse({
      ...validData,
      quizAnswers: 'not-an-array',
    });
    expect(result.success).toBe(false);
  });

  it('異常: earnedPointsが小数でバリデーション失敗', () => {
    const result = saveTrainingResultSchema.safeParse({
      ...validData,
      earnedPoints: 10.5,
    });
    expect(result.success).toBe(false);
  });

  it('異常: sessionId欠落でバリデーション失敗', () => {
    const { sessionId: _, ...withoutSessionId } = validData;
    const result = saveTrainingResultSchema.safeParse(withoutSessionId);
    expect(result.success).toBe(false);
  });
});
