import { recordsListQuerySchema } from '../../../src/schemas/records';

describe('recordsListQuerySchema', () => {
  it('正常: 空オブジェクト → page=1, limit=10のデフォルト適用', () => {
    const result = recordsListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
      expect(result.data.type).toBeUndefined();
    }
  });

  it('正常: 全フィールド指定 → そのまま通る', () => {
    const result = recordsListQuerySchema.safeParse({
      type: 'horizontal',
      page: 3,
      limit: 20,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('horizontal');
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(20);
    }
  });

  it.each([
    'horizontal',
    'vertical',
    'diagonal',
    'complex',
    'sequence',
    'continuous',
  ] as const)('正常: type="%s" でバリデーション成功', (type) => {
    const result = recordsListQuerySchema.safeParse({ type });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe(type);
    }
  });

  it('正常: 文字列 "5" → z.coerceで数値5に変換', () => {
    const result = recordsListQuerySchema.safeParse({ page: '5', limit: '20' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(5);
      expect(result.data.limit).toBe(20);
    }
  });

  it('異常: 無効なtype → fail', () => {
    const result = recordsListQuerySchema.safeParse({ type: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('異常: page=0 → fail', () => {
    const result = recordsListQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('異常: limit=101 → fail', () => {
    const result = recordsListQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it('異常: limit=-1 → fail', () => {
    const result = recordsListQuerySchema.safeParse({ limit: -1 });
    expect(result.success).toBe(false);
  });
});
