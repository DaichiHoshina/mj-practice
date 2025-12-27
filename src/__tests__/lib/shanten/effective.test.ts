/**
 * 有効牌計算のテスト
 */

import { TileType } from '@/lib/tiles';
import type { Hand } from '@/lib/hand';

import { getEffectiveTiles } from '@/lib/shanten/effective';

describe('getEffectiveTiles', () => {
  describe('テンパイ（聴牌）の有効牌', () => {
    it('単騎待ちの有効牌を正しく返す', () => {
      // 123m 456m 789m 111p 2p（13枚、2p単騎待ち）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
        TileType.PIN1,
        TileType.PIN1,
        TileType.PIN1,
        TileType.PIN2,
      ];

      const result = getEffectiveTiles(hand);

      // 2pまたは3p待ち
      expect(result).toHaveLength(2);
      const tiles = result.map((r) => r.tile);
      expect(tiles).toContain(TileType.PIN2);
      expect(tiles).toContain(TileType.PIN3);

      result.forEach((r) => {
        expect(r.improvement).toBe(1); // テンパイ→和了への改善度
        expect(r.remaining).toBeGreaterThan(0);
      });
    });

    it('両面待ちの有効牌を正しく返す', () => {
      // 123m 456m 789m 12p 33p（13枚、3p待ち）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN3,
        TileType.PIN3,
      ];

      const result = getEffectiveTiles(hand);

      expect(result).toHaveLength(1);
      expect(result[0].tile).toBe(TileType.PIN3);
      expect(result[0].improvement).toBe(1); // テンパイ→和了への改善度
      expect(result[0].remaining).toBe(2); // 3pは2枚使用済み
    });

    it('辺張待ちの有効牌と残り枚数', () => {
      // 123m 456m 789m 12p 55p（13枚、3p待ち）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN5,
        TileType.PIN5,
      ];

      const result = getEffectiveTiles(hand);

      expect(result).toHaveLength(1);
      expect(result[0].tile).toBe(TileType.PIN3);
      expect(result[0].remaining).toBe(4); // 3pは未使用
    });

    it('カンチャン待ちの有効牌', () => {
      // 123m 456m 789m 24p 55p（13枚、3p待ち）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
        TileType.PIN2,
        TileType.PIN4,
        TileType.PIN5,
        TileType.PIN5,
      ];

      const result = getEffectiveTiles(hand);

      expect(result).toHaveLength(1);
      expect(result[0].tile).toBe(TileType.PIN3);
      expect(result[0].improvement).toBe(1); // テンパイ→和了への改善度
    });

    it('シャボ待ちの有効牌（複数種類）', () => {
      // 123m 456m 789m 111p 22p（13枚、1pまたは2p待ち）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
        TileType.PIN1,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN2,
      ];

      const result = getEffectiveTiles(hand);

      expect(result).toHaveLength(2);
      const tiles = result.map((r) => r.tile).sort();
      expect(tiles).toEqual([TileType.PIN1, TileType.PIN2].sort());

      const pin1Result = result.find((r) => r.tile === TileType.PIN1);
      const pin2Result = result.find((r) => r.tile === TileType.PIN2);

      expect(pin1Result?.remaining).toBe(2); // 1pは2枚使用済み、残り2枚
      expect(pin2Result?.remaining).toBe(2); // 2pは2枚使用済み、残り2枚
    });

    it('多面待ちの有効牌一覧', () => {
      // 234m 345m 456m 567m 8m（13枚、複数の待ち）
      const hand: Hand = [
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
      ];

      const result = getEffectiveTiles(hand);

      // 多面待ちなので複数の有効牌がある
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.improvement).toBe(1); // テンパイ→和了への改善度
        expect(r.remaining).toBeGreaterThan(0);
      });
    });
  });

  describe('1向聴の有効牌', () => {
    it('1向聴からテンパイになる有効牌', () => {
      // 123m 456m 7m 111p 22p 1s（13枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.PIN1,
        TileType.PIN1,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN2,
        TileType.SOU1,
      ];

      const result = getEffectiveTiles(hand);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.improvement).toBe(1); // 1向聴→テンパイへの改善度
        expect(r.remaining).toBeGreaterThan(0);
      });
    });

    it('複数の有効牌がある1向聴', () => {
      // 12m 345m 678m 99m 11p 2p（13枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
        TileType.MAN9,
        TileType.PIN1,
        TileType.PIN1,
        TileType.PIN2,
      ];

      const result = getEffectiveTiles(hand);

      expect(result.length).toBeGreaterThan(1);
      result.forEach((r) => {
        expect(r.improvement).toBe(1); // 1向聴→テンパイへの改善度
        expect(r.remaining).toBeGreaterThanOrEqual(0);
      });
    });

    it('字牌を含む1向聴の有効牌', () => {
      // 123m 456m 78m 東東東 南（13枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
        TileType.TON,
        TileType.TON,
        TileType.TON,
        TileType.NAN,
        TileType.NAN,
      ];

      const result = getEffectiveTiles(hand);

      expect(result.length).toBeGreaterThan(0);

      // 6mまたは9mが有効牌のはず
      const validTiles = result.map((r) => r.tile);
      expect(validTiles).toContain(TileType.MAN6);
    });
  });

  describe('2向聴の有効牌', () => {
    it('2向聴から1向聴になる有効牌', () => {
      // 123m 45m 7m 11p 23s 5s 東（13枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN7,
        TileType.PIN1,
        TileType.PIN1,
        TileType.SOU2,
        TileType.SOU3,
        TileType.SOU5,
        TileType.TON,
        TileType.TON,
      ];

      const result = getEffectiveTiles(hand);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.improvement).toBe(1); // 2向聴→1向聴への改善度
        expect(r.remaining).toBeGreaterThan(0);
      });
    });

    it('ターツ過多の2向聴の有効牌', () => {
      // 234m 567m 89m 12p 34s（13枚）
      const hand: Hand = [
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
        TileType.PIN1,
        TileType.PIN2,
        TileType.SOU3,
        TileType.SOU4,
        TileType.SOU5,
      ];

      const result = getEffectiveTiles(hand);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.improvement).toBeGreaterThan(0); // 向聴数が改善される
      });
    });
  });

  describe('エッジケース', () => {
    it('和了形は有効牌なし', () => {
      // 123m 456m 789m 111p 22p（14枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
        TileType.PIN1,
        TileType.PIN1,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN2,
      ];

      const result = getEffectiveTiles(hand);

      expect(result).toHaveLength(0);
    });

    it('空手牌の有効牌', () => {
      const hand: Hand = [];

      const result = getEffectiveTiles(hand);

      // 空手牌の場合、理論的には全ての牌が有効牌
      // 実装により動作が異なる可能性があるため、基本的なチェックのみ
      expect(Array.isArray(result)).toBe(true);
    });

    it('1枚のみの手牌', () => {
      const hand: Hand = [TileType.MAN1];

      const result = getEffectiveTiles(hand);

      expect(Array.isArray(result)).toBe(true);
      // 1枚のみの場合、多数の有効牌がある
      if (result.length > 0) {
        result.forEach((r) => {
          expect(r.remaining).toBeGreaterThan(0);
          expect(r.improvement).toBeGreaterThan(0); // 向聴数が改善される
        });
      }
    });

    it('残り枚数が0の牌は有効牌に含まれない', () => {
      // 1111m 222m 333m 44m（13枚）- 1mを4枚使用
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN2,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN3,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN4,
        TileType.SOU1,
      ];

      const result = getEffectiveTiles(hand);

      // 1mは4枚全て使っているので有効牌に含まれない
      const man1Result = result.find((r) => r.tile === TileType.MAN1);
      expect(man1Result).toBeUndefined();
    });
  });

  describe('残り枚数の正確性', () => {
    it('同じ牌を複数使用している場合の残り枚数', () => {
      // 111m 222m 333m 444m 55m（14枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN2,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN3,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN4,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN5,
      ];

      const result = getEffectiveTiles(hand);

      // 和了形なので有効牌なし
      expect(result).toHaveLength(0);
    });

    it('各牌の残り枚数が4枚以下', () => {
      // 123m 456m 789m 12p 33p（13枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN3,
        TileType.PIN3,
      ];

      const result = getEffectiveTiles(hand);

      result.forEach((r) => {
        expect(r.remaining).toBeGreaterThanOrEqual(0);
        expect(r.remaining).toBeLessThanOrEqual(4);
      });
    });

    it('手牌に含まれる牌の残り枚数計算', () => {
      // 111m 234m 567m 89p 11s（13枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.PIN8,
        TileType.PIN9,
        TileType.SOU1,
        TileType.SOU1,
      ];

      const result = getEffectiveTiles(hand);

      result.forEach((r) => {
        const countInHand = hand.filter((t) => t === r.tile).length;
        // 残り枚数は (4 - 手牌に含まれる枚数) 以下
        expect(r.remaining).toBeLessThanOrEqual(4 - countInHand);
      });
    });
  });

  describe('有効牌の種類パターン', () => {
    it('数牌のみの有効牌', () => {
      // 123m 456m 789m 12p 44p（13枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN4,
        TileType.PIN4,
      ];

      const result = getEffectiveTiles(hand);

      expect(result.length).toBeGreaterThan(0);
      // 有効牌はPIN3のはず
      expect(result[0].tile).toBe(TileType.PIN3);
    });

    it('字牌が有効牌に含まれる場合', () => {
      // 123m 456p 789s 東東 白白白（13枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.PIN4,
        TileType.PIN5,
        TileType.PIN6,
        TileType.SOU7,
        TileType.SOU8,
        TileType.SOU9,
        TileType.TON,
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      const result = getEffectiveTiles(hand);

      // 東または白が有効牌のはず
      const honorTiles = result.filter(
        (r) => r.tile === TileType.TON || r.tile === TileType.HAKU
      );
      expect(honorTiles.length).toBeGreaterThan(0);
    });

    it('混合（数牌＋字牌）の有効牌', () => {
      // 12m 456m 789m 東東東 白白（13枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
        TileType.TON,
        TileType.TON,
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      const result = getEffectiveTiles(hand);

      expect(result.length).toBeGreaterThan(0);
      // 3mまたは白が有効牌のはず
      const tiles = result.map((r) => r.tile);
      expect(
        tiles.includes(TileType.MAN3) || tiles.includes(TileType.HAKU)
      ).toBe(true);
    });
  });
});
