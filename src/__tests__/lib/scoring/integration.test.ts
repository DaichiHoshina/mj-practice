/**
 * 統合テスト: 役判定 → 符計算 → 点数計算の全フロー
 * サンプル問題5問で実装の整合性を検証
 */

import { TileType } from '@/lib/tiles';
import { detectYaku, calculateScore, type WinContext } from '@/lib/scoring';
import { calculateFu } from '@/lib/scoring/fuCalculator';
import sampleQuestions from '@/data/questions/scoring-sample.json';

/**
 * テスト用ヘルパー：JSON形式の牌文字列をTileTypeに変換
 */
function parseTile(tileStr: string): TileType {
  const tileMap: Record<string, TileType> = {
    '1m': TileType.MAN1,
    '2m': TileType.MAN2,
    '3m': TileType.MAN3,
    '4m': TileType.MAN4,
    '5m': TileType.MAN5,
    '6m': TileType.MAN6,
    '7m': TileType.MAN7,
    '8m': TileType.MAN8,
    '9m': TileType.MAN9,
    '1p': TileType.PIN1,
    '2p': TileType.PIN2,
    '3p': TileType.PIN3,
    '4p': TileType.PIN4,
    '5p': TileType.PIN5,
    '6p': TileType.PIN6,
    '7p': TileType.PIN7,
    '8p': TileType.PIN8,
    '9p': TileType.PIN9,
    '1s': TileType.SOU1,
    '2s': TileType.SOU2,
    '3s': TileType.SOU3,
    '4s': TileType.SOU4,
    '5s': TileType.SOU5,
    '6s': TileType.SOU6,
    '7s': TileType.SOU7,
    '8s': TileType.SOU8,
    '9s': TileType.SOU9,
    '1z': TileType.TON,
    '2z': TileType.NAN,
    '3z': TileType.SHAA,
    '4z': TileType.PEI,
    '5z': TileType.HAKU,
    '6z': TileType.HATSU,
    '7z': TileType.CHUN,
  };

  const tile = tileMap[tileStr];
  if (!tile) {
    throw new Error(`Unknown tile: $${tileStr}`);
  }
  return tile;
}

/**
 * テスト用ヘルパー：WinContextを構築
 */
function buildContext(questionData: (typeof sampleQuestions)[0]): WinContext {
  return {
    winningTile: parseTile(questionData.winningTile),
    isTsumo: questionData.isTsumo,
    isDealer: questionData.isDealer,
    isMenzen: true,
    isRiichi: questionData.isRiichi,
    roundWind: (questionData.situation.roundWind === 'ton' ? 'ton' : 'nan') as
      | 'ton'
      | 'nan',
    seatWind: (questionData.situation.seatWind === 'ton'
      ? 'ton'
      : questionData.situation.seatWind === 'nan'
        ? 'nan'
        : 'shaa') as 'ton' | 'nan' | 'shaa' | 'pei',
    dora: questionData.dora?.map((d) => parseTile(d)) ?? [],
  };
}

describe('Integration: 役判定 → 符計算 → 点数計算', () => {
  describe('サンプル問題の処理検証', () => {
    /**
     * 問題1: リーチ・ツモのみの基本形
     * 検証: リーチ役が検出され、正常に計算される
     */
    it('問題1: リーチ・ツモのみの基本形 → 正常に計算される', () => {
      const question = sampleQuestions[0];
      const hand = question.hand.map((t) =>
        parseTile(t)
      ) as readonly TileType[];
      const context = buildContext(question);

      const yakuResult = detectYaku(hand, context);
      const fuBreakdown = calculateFu(hand, yakuResult, context);
      const scoreResult = calculateScore(
        fuBreakdown.total,
        yakuResult.totalHan,
        context.isDealer,
        context.isTsumo
      );

      expect(hand).toHaveLength(14);
      expect(yakuResult.totalHan).toBeGreaterThan(0);
      expect(yakuResult.yakuList.map((y) => y.id)).toContain('riichi');
      expect(fuBreakdown.total % 10).toBe(0);
      expect(scoreResult.score % 100).toBe(0);
      expect(scoreResult.score).toBeGreaterThan(0);
    });

    /**
     * 問題2: タンヤオ・役牌の複合
     * 検証: 点数計算が正常に行われる
     */
    it('問題2: タンヤオ・役牌の複合 → 正常に計算される', () => {
      const question = sampleQuestions[1];
      const hand = question.hand.map((t) =>
        parseTile(t)
      ) as readonly TileType[];
      const context = buildContext(question);

      const yakuResult = detectYaku(hand, context);
      const fuBreakdown = calculateFu(hand, yakuResult, context);
      const scoreResult = calculateScore(
        fuBreakdown.total,
        yakuResult.totalHan,
        context.isDealer,
        context.isTsumo
      );

      expect(hand).toHaveLength(14);
      expect(scoreResult.score).toBeGreaterThan(0);
      expect(scoreResult.score % 100).toBe(0);
      expect(scoreResult.payments.fromLoser).toBeDefined();
    });

    /**
     * 問題3: リーチ・タンヤオ・複合役
     * 検証: 複数役が検出される
     */
    it('問題3: リーチ・タンヤオ・複合役 → 正常に計算される', () => {
      const question = sampleQuestions[2];
      const hand = question.hand.map((t) =>
        parseTile(t)
      ) as readonly TileType[];
      const context = buildContext(question);

      const yakuResult = detectYaku(hand, context);
      const fuBreakdown = calculateFu(hand, yakuResult, context);
      const scoreResult = calculateScore(
        fuBreakdown.total,
        yakuResult.totalHan,
        context.isDealer,
        context.isTsumo
      );

      expect(hand).toHaveLength(14);
      expect(yakuResult.totalHan).toBeGreaterThanOrEqual(1);
      const yakuIds = yakuResult.yakuList.map((y) => y.id);
      expect(yakuIds).toContain('riichi');
      expect(scoreResult.score % 100).toBe(0);
    });

    /**
     * 問題4: 三色同順・平和・ツモの複合
     * 検証: 平和ツモで20符が正しく計算される
     */
    it('問題4: 三色同順・平和・ツモの複合 → 平和ツモで20符', () => {
      const question = sampleQuestions[3];
      const hand = question.hand.map((t) =>
        parseTile(t)
      ) as readonly TileType[];
      const context = buildContext(question);

      const yakuResult = detectYaku(hand, context);
      const fuBreakdown = calculateFu(hand, yakuResult, context);
      const scoreResult = calculateScore(
        fuBreakdown.total,
        yakuResult.totalHan,
        context.isDealer,
        context.isTsumo
      );

      expect(hand).toHaveLength(14);
      expect(yakuResult.yakuList.map((y) => y.id)).toContain('pinfu');
      expect(fuBreakdown.total).toBe(20);
      expect(scoreResult.score % 100).toBe(0);
    });

    /**
     * 問題5: 親の清一色跳満
     * 検証: 清一色が検出され、高翻数で計算される
     */
    it('問題5: 親の清一色跳満 → 清一色で高翻数', () => {
      const question = sampleQuestions[4];
      const hand = question.hand.map((t) =>
        parseTile(t)
      ) as readonly TileType[];
      const context = buildContext(question);

      const yakuResult = detectYaku(hand, context);
      const fuBreakdown = calculateFu(hand, yakuResult, context);
      const scoreResult = calculateScore(
        fuBreakdown.total,
        yakuResult.totalHan,
        context.isDealer,
        context.isTsumo
      );

      expect(hand).toHaveLength(14);
      expect(yakuResult.yakuList.map((y) => y.id)).toContain('chinitsu');
      expect(yakuResult.totalHan).toBeGreaterThanOrEqual(6);
      expect(['haneman', 'baiman']).toContain(scoreResult.scoreType);
      expect(scoreResult.score % 100).toBe(0);
    });
  });

  describe('フロー全体の正合性チェック', () => {
    it('全サンプル問題でエラーなく処理できる', () => {
      for (const question of sampleQuestions) {
        const hand = question.hand.map((t) =>
          parseTile(t)
        ) as readonly TileType[];
        const context = buildContext(question);

        expect(() => {
          const yakuResult = detectYaku(hand, context);
          const fuBreakdown = calculateFu(hand, yakuResult, context);
          const scoreResult = calculateScore(
            fuBreakdown.total,
            yakuResult.totalHan,
            context.isDealer,
            context.isTsumo
          );

          expect(yakuResult).toHaveProperty('yakuList');
          expect(yakuResult).toHaveProperty('totalHan');
          expect(yakuResult).toHaveProperty('isYakuman');
          expect(fuBreakdown).toHaveProperty('total');
          expect(scoreResult).toHaveProperty('score');
        }).not.toThrow();
      }
    });

    it('役の翻数と符が正しい範囲にある', () => {
      for (const question of sampleQuestions) {
        const hand = question.hand.map((t) =>
          parseTile(t)
        ) as readonly TileType[];
        const context = buildContext(question);

        const yakuResult = detectYaku(hand, context);
        const fuBreakdown = calculateFu(hand, yakuResult, context);

        expect(yakuResult.totalHan).toBeGreaterThanOrEqual(0);
        expect(yakuResult.totalHan).toBeLessThanOrEqual(13);
        expect(fuBreakdown.total).toBeGreaterThanOrEqual(20);
        expect(fuBreakdown.total % 10).toBe(0);
      }
    });

    it('計算された点数が100点単位である', () => {
      for (const question of sampleQuestions) {
        const hand = question.hand.map((t) =>
          parseTile(t)
        ) as readonly TileType[];
        const context = buildContext(question);

        const yakuResult = detectYaku(hand, context);
        const fuBreakdown = calculateFu(hand, yakuResult, context);
        const scoreResult = calculateScore(
          fuBreakdown.total,
          yakuResult.totalHan,
          context.isDealer,
          context.isTsumo
        );

        expect(scoreResult.score % 100).toBe(0);
      }
    });

    it('支払い内訳が和了形式に応じて正しい', () => {
      for (const question of sampleQuestions) {
        const hand = question.hand.map((t) =>
          parseTile(t)
        ) as readonly TileType[];
        const context = buildContext(question);

        const yakuResult = detectYaku(hand, context);
        const fuBreakdown = calculateFu(hand, yakuResult, context);
        const scoreResult = calculateScore(
          fuBreakdown.total,
          yakuResult.totalHan,
          context.isDealer,
          context.isTsumo
        );

        if (question.isTsumo) {
          expect(scoreResult.payments.fromLoser).toBeUndefined();
          if (!question.isDealer) {
            expect(scoreResult.payments.fromDealer).toBeDefined();
            expect(scoreResult.payments.fromNonDealer).toBeDefined();
          } else {
            expect(scoreResult.payments.fromNonDealer).toBeDefined();
          }
        } else {
          expect(scoreResult.payments.fromLoser).toBeDefined();
          expect(scoreResult.payments.fromDealer).toBeUndefined();
          expect(scoreResult.payments.fromNonDealer).toBeUndefined();
        }
      }
    });
  });

  describe('計算ロジックの検証', () => {
    it('基本点の計算が正しい', () => {
      const fu = 30;
      const han = 2;
      const scoreResult = calculateScore(fu, han, false, false);
      const expectedBaseScore = fu * Math.pow(2, han + 2);

      expect(scoreResult.baseScore).toBe(expectedBaseScore);
    });

    it('スコアタイプが正しく判定される', () => {
      const testCases: Array<{
        han: number;
        fu: number;
        expectedType: string;
      }> = [
        { han: 4, fu: 30, expectedType: 'normal' },
        { han: 5, fu: 40, expectedType: 'mangan' },
        { han: 6, fu: 40, expectedType: 'haneman' },
        { han: 8, fu: 40, expectedType: 'baiman' },
        { han: 11, fu: 40, expectedType: 'sanbaiman' },
        { han: 13, fu: 40, expectedType: 'kazoeYakuman' },
      ];

      for (const { han, fu, expectedType } of testCases) {
        const result = calculateScore(fu, han, false, false);
        expect(result.scoreType).toBe(expectedType);
      }
    });

    it('親と子で異なる点数が計算される', () => {
      const fu = 40;
      const han = 3;

      const dealerResult = calculateScore(fu, han, true, false);
      const nonDealerResult = calculateScore(fu, han, false, false);

      expect(dealerResult.score).toBeGreaterThan(nonDealerResult.score);
    });
  });

  describe('エッジケースの検証', () => {
    it('異なるfu値での計算が正しい', () => {
      const fuValues = [20, 30, 40, 50, 60];
      const han = 2;

      for (const fu of fuValues) {
        const result = calculateScore(fu, han, false, false);

        expect(result.score % 100).toBe(0);
        expect(result.score).toBeGreaterThan(0);
      }
    });

    it('1翻から13翻までの翻数で計算できる', () => {
      for (let han = 1; han <= 13; han++) {
        const result = calculateScore(30, han, false, false);

        expect(result.score % 100).toBe(0);
        expect(result.score).toBeGreaterThan(0);
      }
    });
  });
});
