/**
 * scoreCalculator.ts のテスト
 */

import { calculateScore } from '../../../lib/scoring/scoreCalculator';

describe('calculateScore', () => {
  /**
   * 満貫未満：基本点 × 2^(翻+2)
   * 親ロン：基本点 × 6（100点単位切り上げ）
   * 子ロン：基本点 × 4（100点単位切り上げ）
   * 親ツモ：基本点 × 2 × 3（各子が基本点 × 2）
   * 子ツモ：親が基本点 × 2、子が基本点 × 1（各子が基本点 × 1）
   */

  describe('基本点計算', () => {
    it('4翻40符の基本点', () => {
      const result = calculateScore(40, 4, false, false);
      const expectedBase = 40 * Math.pow(2, 4 + 2); // 40 * 64 = 2560
      expect(result.baseScore).toBe(expectedBase);
    });

    it('2翻30符の基本点', () => {
      const result = calculateScore(30, 2, false, false);
      const expectedBase = 30 * Math.pow(2, 2 + 2); // 30 * 16 = 480
      expect(result.baseScore).toBe(expectedBase);
    });
  });

  describe('満貫 - 4翻40符（基本点2000以上）', () => {
    it('4翻40符 子ロン → 8000', () => {
      const result = calculateScore(40, 4, false, false);
      expect(result.scoreType).toBe('mangan');
      expect(result.score).toBe(8000);
      expect(result.payments.fromLoser).toBe(8000);
    });

    it('4翻40符 子ツモ → 親4000, 子2000', () => {
      const result = calculateScore(40, 4, false, true);
      expect(result.scoreType).toBe('mangan');
      expect(result.score).toBe(8000);
      expect(result.payments.fromDealer).toBe(4000);
      expect(result.payments.fromNonDealer).toBe(2000);
    });

    it('4翻40符 親ロン → 12000', () => {
      const result = calculateScore(40, 4, true, false);
      expect(result.scoreType).toBe('mangan');
      expect(result.score).toBe(12000);
      expect(result.payments.fromLoser).toBe(12000);
    });

    it('4翻40符 親ツモ → 各4000', () => {
      const result = calculateScore(40, 4, true, true);
      expect(result.scoreType).toBe('mangan');
      expect(result.score).toBe(12000);
      expect(result.payments.fromNonDealer).toBe(4000);
    });
  });

  describe('スコアタイプ判定', () => {
    it('4翻30符は normal', () => {
      const result = calculateScore(30, 4, false, false);
      expect(result.scoreType).toBe('normal');
    });

    it('5翻は mangan', () => {
      const result = calculateScore(40, 5, false, false);
      expect(result.scoreType).toBe('mangan');
    });

    it('6翻は haneman', () => {
      const result = calculateScore(40, 6, false, false);
      expect(result.scoreType).toBe('haneman');
    });

    it('8翻は baiman', () => {
      const result = calculateScore(40, 8, false, false);
      expect(result.scoreType).toBe('baiman');
    });

    it('11翻は sanbaiman', () => {
      const result = calculateScore(40, 11, false, false);
      expect(result.scoreType).toBe('sanbaiman');
    });

    it('13翻は kazoeYakuman', () => {
      const result = calculateScore(40, 13, false, false);
      expect(result.scoreType).toBe('kazoeYakuman');
    });
  });

  describe('満貫（5翻）', () => {
    it('5翻 子ロン → 8000', () => {
      const result = calculateScore(40, 5, false, false);
      expect(result.scoreType).toBe('mangan');
      expect(result.score).toBe(8000);
    });

    it('5翻 子ツモ → 親4000, 子2000', () => {
      const result = calculateScore(40, 5, false, true);
      expect(result.scoreType).toBe('mangan');
      expect(result.score).toBe(8000);
      expect(result.payments.fromDealer).toBe(4000);
      expect(result.payments.fromNonDealer).toBe(2000);
    });

    it('5翻 親ロン → 12000', () => {
      const result = calculateScore(40, 5, true, false);
      expect(result.scoreType).toBe('mangan');
      expect(result.score).toBe(12000);
    });

    it('5翻 親ツモ → 各4000', () => {
      const result = calculateScore(40, 5, true, true);
      expect(result.scoreType).toBe('mangan');
      expect(result.score).toBe(12000);
      expect(result.payments.fromNonDealer).toBe(4000);
    });
  });

  describe('跳満（6-7翻）', () => {
    it('6翻 子ロン → 12000', () => {
      const result = calculateScore(40, 6, false, false);
      expect(result.scoreType).toBe('haneman');
      expect(result.score).toBe(12000);
    });

    it('7翻 子ロン → 12000', () => {
      const result = calculateScore(40, 7, false, false);
      expect(result.scoreType).toBe('haneman');
      expect(result.score).toBe(12000);
    });

    it('6翻 子ツモ → 親6000, 子3000', () => {
      const result = calculateScore(40, 6, false, true);
      expect(result.scoreType).toBe('haneman');
      expect(result.score).toBe(12000);
      expect(result.payments.fromDealer).toBe(6000);
      expect(result.payments.fromNonDealer).toBe(3000);
    });

    it('6翻 親ロン → 18000', () => {
      const result = calculateScore(40, 6, true, false);
      expect(result.scoreType).toBe('haneman');
      expect(result.score).toBe(18000);
    });

    it('6翻 親ツモ → 各6000', () => {
      const result = calculateScore(40, 6, true, true);
      expect(result.scoreType).toBe('haneman');
      expect(result.score).toBe(18000);
      expect(result.payments.fromNonDealer).toBe(6000);
    });
  });

  describe('倍満（8-10翻）', () => {
    it('8翻 子ロン → 16000', () => {
      const result = calculateScore(40, 8, false, false);
      expect(result.scoreType).toBe('baiman');
      expect(result.score).toBe(16000);
    });

    it('10翻 子ロン → 16000', () => {
      const result = calculateScore(40, 10, false, false);
      expect(result.scoreType).toBe('baiman');
      expect(result.score).toBe(16000);
    });

    it('8翻 子ツモ → 親8000, 子4000', () => {
      const result = calculateScore(40, 8, false, true);
      expect(result.scoreType).toBe('baiman');
      expect(result.score).toBe(16000);
      expect(result.payments.fromDealer).toBe(8000);
      expect(result.payments.fromNonDealer).toBe(4000);
    });

    it('8翻 親ロン → 24000', () => {
      const result = calculateScore(40, 8, true, false);
      expect(result.scoreType).toBe('baiman');
      expect(result.score).toBe(24000);
    });

    it('8翻 親ツモ → 各8000', () => {
      const result = calculateScore(40, 8, true, true);
      expect(result.scoreType).toBe('baiman');
      expect(result.score).toBe(24000);
      expect(result.payments.fromNonDealer).toBe(8000);
    });
  });

  describe('三倍満（11-12翻）', () => {
    it('11翻 子ロン → 24000', () => {
      const result = calculateScore(40, 11, false, false);
      expect(result.scoreType).toBe('sanbaiman');
      expect(result.score).toBe(24000);
    });

    it('12翻 子ロン → 24000', () => {
      const result = calculateScore(40, 12, false, false);
      expect(result.scoreType).toBe('sanbaiman');
      expect(result.score).toBe(24000);
    });

    it('11翻 子ツモ → 親12000, 子6000', () => {
      const result = calculateScore(40, 11, false, true);
      expect(result.scoreType).toBe('sanbaiman');
      expect(result.score).toBe(24000);
      expect(result.payments.fromDealer).toBe(12000);
      expect(result.payments.fromNonDealer).toBe(6000);
    });

    it('11翻 親ロン → 36000', () => {
      const result = calculateScore(40, 11, true, false);
      expect(result.scoreType).toBe('sanbaiman');
      expect(result.score).toBe(36000);
    });

    it('11翻 親ツモ → 各12000', () => {
      const result = calculateScore(40, 11, true, true);
      expect(result.scoreType).toBe('sanbaiman');
      expect(result.score).toBe(36000);
      expect(result.payments.fromNonDealer).toBe(12000);
    });
  });

  describe('数え役満（13翻以上）', () => {
    it('13翻 子ロン → 32000', () => {
      const result = calculateScore(40, 13, false, false);
      expect(result.scoreType).toBe('kazoeYakuman');
      expect(result.score).toBe(32000);
    });

    it('13翻 子ツモ → 親16000, 子8000', () => {
      const result = calculateScore(40, 13, false, true);
      expect(result.scoreType).toBe('kazoeYakuman');
      expect(result.score).toBe(32000);
      expect(result.payments.fromDealer).toBe(16000);
      expect(result.payments.fromNonDealer).toBe(8000);
    });

    it('13翻 親ロン → 48000', () => {
      const result = calculateScore(40, 13, true, false);
      expect(result.scoreType).toBe('kazoeYakuman');
      expect(result.score).toBe(48000);
    });

    it('13翻 親ツモ → 各16000', () => {
      const result = calculateScore(40, 13, true, true);
      expect(result.scoreType).toBe('kazoeYakuman');
      expect(result.score).toBe(48000);
      expect(result.payments.fromNonDealer).toBe(16000);
    });
  });

  describe('各種パターン組み合わせ', () => {
    it('1翻30符 子ロン → 1000', () => {
      const result = calculateScore(30, 1, false, false);
      expect(result.scoreType).toBe('normal');
      expect(result.score).toBe(1000);
    });

    it('2翻30符 子ロン → 2000', () => {
      const result = calculateScore(30, 2, false, false);
      expect(result.scoreType).toBe('normal');
      expect(result.score).toBe(2000);
    });

    it('3翻30符 子ロン → 3900', () => {
      const result = calculateScore(30, 3, false, false);
      expect(result.scoreType).toBe('normal');
      expect(result.score).toBe(3900);
    });

    it('3翻50符 子ロン → 6400', () => {
      const result = calculateScore(50, 3, false, false);
      expect(result.scoreType).toBe('normal');
      expect(result.score).toBe(6400);
    });

    it('2翻50符 子ロン → 3200', () => {
      const result = calculateScore(50, 2, false, false);
      expect(result.scoreType).toBe('normal');
      expect(result.score).toBe(3200);
    });
  });

  describe('結果の完全性チェック', () => {
    it('すべての必須フィールドを返す', () => {
      const result = calculateScore(40, 4, false, false);
      expect(result).toHaveProperty('fu');
      expect(result).toHaveProperty('han');
      expect(result).toHaveProperty('baseScore');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('scoreType');
      expect(result).toHaveProperty('isDealer');
      expect(result).toHaveProperty('isTsumo');
      expect(result).toHaveProperty('payments');
    });

    it('100点単位で丸められている', () => {
      const result = calculateScore(30, 2, false, false);
      expect(result.score % 100).toBe(0);
    });
  });

  describe('ツモとロンの支払い内訳', () => {
    it('子ツモの支払い内訳が正しい', () => {
      const result = calculateScore(40, 4, false, true);
      expect(result.payments.fromDealer).toBeDefined();
      expect(result.payments.fromNonDealer).toBeDefined();
      expect(result.payments.fromLoser).toBeUndefined();
      expect(result.payments.total).toBeGreaterThan(0);
    });

    it('親ツモの支払い内訳が正しい', () => {
      const result = calculateScore(40, 4, true, true);
      expect(result.payments.fromNonDealer).toBeDefined();
      expect(result.payments.fromDealer).toBeUndefined();
      expect(result.payments.fromLoser).toBeUndefined();
    });

    it('ロンの支払い内訳が正しい', () => {
      const result = calculateScore(40, 4, false, false);
      expect(result.payments.fromLoser).toBeDefined();
      expect(result.payments.fromDealer).toBeUndefined();
      expect(result.payments.fromNonDealer).toBeUndefined();
    });
  });

  describe('エッジケース', () => {
    it('20符1翻 子ロン → 400以上', () => {
      const result = calculateScore(20, 1, false, false);
      expect(result.score % 100).toBe(0);
      expect(result.score).toBeGreaterThanOrEqual(400);
    });

    it('110符の高符数', () => {
      const result = calculateScore(110, 2, false, false);
      expect(result.scoreType).toBe('normal');
      expect(result.score % 100).toBe(0);
    });
  });
});
