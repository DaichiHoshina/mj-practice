import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  loadMachiQuestions,
  getMachiCandidates,
  checkMachiAnswer,
} from '@/lib/quiz/machiLoader';
import { TileType } from '@/lib/tiles';
import { MachiQuestion, QuizDifficulty } from '@/lib/quiz/types';

// fetchモック用の型
type MockFetch = jest.Mock;

describe('machiLoader', () => {
  describe('loadMachiQuestions', () => {
    let originalFetch: typeof global.fetch;
    let mockFetch: MockFetch;
    let consoleErrorSpy: jest.SpyInstance;

    const sampleQuestions: MachiQuestion[] = [
      {
        id: 'q1',
        hand: [
          TileType.MAN1,
          TileType.MAN2,
          TileType.MAN3,
          TileType.MAN4,
          TileType.MAN5,
          TileType.MAN6,
          TileType.MAN7,
        ],
        correctAnswers: [TileType.MAN1, TileType.MAN4, TileType.MAN7],
        difficulty: 'easy',
        pattern: '一気通貫待ち',
        explanation: '1m-4m-7m待ち',
      },
      {
        id: 'q2',
        hand: [
          TileType.MAN2,
          TileType.MAN3,
          TileType.MAN4,
          TileType.MAN5,
          TileType.MAN6,
          TileType.MAN7,
          TileType.MAN8,
        ],
        correctAnswers: [TileType.MAN2, TileType.MAN5, TileType.MAN8],
        difficulty: 'medium',
        pattern: '三面待ち',
        explanation: '2m-5m-8m待ち',
      },
      {
        id: 'q3',
        hand: [
          TileType.MAN1,
          TileType.MAN1,
          TileType.MAN2,
          TileType.MAN3,
          TileType.MAN4,
          TileType.MAN5,
          TileType.MAN6,
        ],
        correctAnswers: [TileType.MAN1, TileType.MAN4, TileType.MAN7],
        difficulty: 'hard',
        pattern: '複合待ち',
        explanation: '複合待ちの例',
      },
    ];

    beforeEach(() => {
      originalFetch = global.fetch;
      mockFetch = jest.fn() as MockFetch;
      global.fetch = mockFetch;
      consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      global.fetch = originalFetch;
      consoleErrorSpy.mockRestore();
    });

    it('fetch成功時にMachiQuestion[]を返す', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ questions: sampleQuestions }),
      });

      // Act
      const result = await loadMachiQuestions();

      // Assert
      expect(result).toHaveLength(3);
      result.forEach((q) => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('hand');
        expect(q).toHaveProperty('correctAnswers');
        expect(q).toHaveProperty('difficulty');
      });
    });

    it('difficulty指定でeasyのみフィルタリングできる', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ questions: sampleQuestions }),
      });

      // Act
      const result = await loadMachiQuestions('easy');

      // Assert
      expect(result.length).toBeGreaterThan(0);
      result.forEach((q) => {
        expect(q.difficulty).toBe('easy');
      });
    });

    it('difficulty指定でmediumのみフィルタリングできる', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ questions: sampleQuestions }),
      });

      // Act
      const result = await loadMachiQuestions('medium');

      // Assert
      expect(result.length).toBeGreaterThan(0);
      result.forEach((q) => {
        expect(q.difficulty).toBe('medium');
      });
    });

    it('difficulty指定でhardのみフィルタリングできる', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ questions: sampleQuestions }),
      });

      // Act
      const result = await loadMachiQuestions('hard');

      // Assert
      expect(result.length).toBeGreaterThan(0);
      result.forEach((q) => {
        expect(q.difficulty).toBe('hard');
      });
    });

    it('difficulty未指定で全件返す', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ questions: sampleQuestions }),
      });

      // Act
      const result = await loadMachiQuestions();

      // Assert
      expect(result).toHaveLength(sampleQuestions.length);
    });

    it('fetch失敗(response.ok=false)でErrorをthrowする', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      // Act & Assert
      await expect(loadMachiQuestions()).rejects.toThrow(
        'Failed to load questions: 404'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load machi questions:',
        expect.any(Error)
      );
    });

    it('fetch失敗(response.ok=false, 500)でErrorをthrowする', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      // Act & Assert
      await expect(loadMachiQuestions()).rejects.toThrow(
        'Failed to load questions: 500'
      );
    });

    it('無効なデータ形式(questions未定義)でErrorをthrowする', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      // Act & Assert
      await expect(loadMachiQuestions()).rejects.toThrow(
        'Invalid question data format'
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('無効なデータ形式(questionsが配列でない)でErrorをthrowする', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ questions: 'not-an-array' }),
      });

      // Act & Assert
      await expect(loadMachiQuestions()).rejects.toThrow(
        'Invalid question data format'
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('無効なデータ形式(questionsがnull)でErrorをthrowする', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ questions: null }),
      });

      // Act & Assert
      await expect(loadMachiQuestions()).rejects.toThrow(
        'Invalid question data format'
      );
    });

    it('ネットワークエラーでErrorをthrowする', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(loadMachiQuestions()).rejects.toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load machi questions:',
        expect.any(Error)
      );
    });

    it('正しいURLでfetchを呼び出す', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ questions: sampleQuestions }),
      });

      // Act
      await loadMachiQuestions();

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/data/questions/machi-7.json');
    });

    it('返却される問題はシャッフルされる（元の配列と異なる順序の可能性）', async () => {
      // Arrange
      const manyQuestions: MachiQuestion[] = Array.from(
        { length: 20 },
        (_, i) => ({
          id: `q${i}`,
          hand: [
            TileType.MAN1,
            TileType.MAN2,
            TileType.MAN3,
            TileType.MAN4,
            TileType.MAN5,
            TileType.MAN6,
            TileType.MAN7,
          ],
          correctAnswers: [TileType.MAN1],
          difficulty: 'easy' as QuizDifficulty,
          pattern: `パターン${i}`,
          explanation: `説明${i}`,
        })
      );

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ questions: manyQuestions }),
      });

      // Act - 複数回実行して順序が変わることを確認
      const results: string[][] = [];
      for (let i = 0; i < 5; i++) {
        const result = await loadMachiQuestions();
        results.push(result.map((q) => q.id));
      }

      // Assert - 少なくとも1回は異なる順序になるはず（確率的テスト）
      const allSameOrder = results.every(
        (r) => JSON.stringify(r) === JSON.stringify(results[0])
      );
      // 20個の要素を5回シャッフルして全て同じ順序になる確率は極めて低い
      expect(allSameOrder).toBe(false);
    });
  });

  describe('getMachiCandidates', () => {
    it('9種の萬子を返す', () => {
      // Act
      const candidates = getMachiCandidates();

      // Assert
      expect(candidates).toHaveLength(9);
    });

    it('1m〜9mの萬子が全て含まれる', () => {
      // Act
      const candidates = getMachiCandidates();

      // Assert
      const expected = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
      ];
      expect(candidates).toEqual(expected);
    });

    it('返り値がTileType[]型として妥当な値を持つ', () => {
      // Act
      const candidates = getMachiCandidates();

      // Assert
      candidates.forEach((tile) => {
        expect(Object.values(TileType)).toContain(tile);
      });
    });

    it('萬子以外の牌が含まれない', () => {
      // Act
      const candidates = getMachiCandidates();

      // Assert
      candidates.forEach((tile) => {
        expect(tile).toMatch(/^[1-9]m$/);
      });
    });
  });

  describe('checkMachiAnswer', () => {
    it('正解と完全一致でtrueを返す', () => {
      // Arrange
      const selected = [TileType.MAN1, TileType.MAN4, TileType.MAN7];
      const correct = [TileType.MAN1, TileType.MAN4, TileType.MAN7] as const;

      // Act
      const result = checkMachiAnswer(selected, correct);

      // Assert
      expect(result).toBe(true);
    });

    it('順序が異なっても完全一致でtrueを返す', () => {
      // Arrange
      const selected = [TileType.MAN7, TileType.MAN1, TileType.MAN4];
      const correct = [TileType.MAN1, TileType.MAN4, TileType.MAN7] as const;

      // Act
      const result = checkMachiAnswer(selected, correct);

      // Assert
      expect(result).toBe(true);
    });

    it('部分一致（正解の一部を選択）でtrueを返す', () => {
      // Arrange
      const selected = [TileType.MAN1, TileType.MAN4];
      const correct = [TileType.MAN1, TileType.MAN4, TileType.MAN7] as const;

      // Act
      const result = checkMachiAnswer(selected, correct);

      // Assert
      expect(result).toBe(true);
    });

    it('正解の1つだけ選択してもtrueを返す', () => {
      // Arrange
      const selected = [TileType.MAN7];
      const correct = [TileType.MAN1, TileType.MAN4, TileType.MAN7] as const;

      // Act
      const result = checkMachiAnswer(selected, correct);

      // Assert
      expect(result).toBe(true);
    });

    it('不正解（正解に含まれない牌を選択）でfalseを返す', () => {
      // Arrange
      const selected = [TileType.MAN1, TileType.MAN2];
      const correct = [TileType.MAN1, TileType.MAN4, TileType.MAN7] as const;

      // Act
      const result = checkMachiAnswer(selected, correct);

      // Assert
      expect(result).toBe(false);
    });

    it('全て不正解の牌を選択でfalseを返す', () => {
      // Arrange
      const selected = [TileType.MAN2, TileType.MAN3, TileType.MAN5];
      const correct = [TileType.MAN1, TileType.MAN4, TileType.MAN7] as const;

      // Act
      const result = checkMachiAnswer(selected, correct);

      // Assert
      expect(result).toBe(false);
    });

    it('空配列でtrueを返す（every()は空配列でtrue）', () => {
      // Arrange
      const selected: TileType[] = [];
      const correct = [TileType.MAN1, TileType.MAN4, TileType.MAN7] as const;

      // Act
      const result = checkMachiAnswer(selected, correct);

      // Assert
      expect(result).toBe(true);
    });

    it('重複選択でfalseを返す', () => {
      // Arrange
      const selected = [TileType.MAN1, TileType.MAN1, TileType.MAN4];
      const correct = [TileType.MAN1, TileType.MAN4, TileType.MAN7] as const;

      // Act
      const result = checkMachiAnswer(selected, correct);

      // Assert
      expect(result).toBe(false);
    });

    it('正解が1つの場合に正しく判定する', () => {
      // Arrange
      const selected = [TileType.MAN5];
      const correct = [TileType.MAN5] as const;

      // Act
      const result = checkMachiAnswer(selected, correct);

      // Assert
      expect(result).toBe(true);
    });

    it('正解が1つの場合に不正解を検出する', () => {
      // Arrange
      const selected = [TileType.MAN3];
      const correct = [TileType.MAN5] as const;

      // Act
      const result = checkMachiAnswer(selected, correct);

      // Assert
      expect(result).toBe(false);
    });

    it('正解に重複がある場合もSetで処理される', () => {
      // Arrange
      const selected = [TileType.MAN1];
      const correct = [TileType.MAN1, TileType.MAN1, TileType.MAN4] as const;

      // Act
      const result = checkMachiAnswer(selected, correct);

      // Assert
      expect(result).toBe(true);
    });
  });
});
