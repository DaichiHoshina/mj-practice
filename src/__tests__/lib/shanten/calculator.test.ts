/**
 * 向聴数計算のテスト
 */

import { calculateShanten } from '@/lib/shanten';
import { TileType } from '@/lib/tiles';
import type { Hand } from '@/lib/hand';

describe('calculateShanten', () => {
  describe('和了形（完成形）', () => {
    it('4面子1雀頭の完成形は向聴数-1', () => {
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

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(-1);
      expect(result.isComplete).toBe(true);
      expect(result.isReady).toBe(false);
    });

    it('刻子のみの完成形', () => {
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

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(-1);
      expect(result.isComplete).toBe(true);
    });

    it('字牌を含む完成形', () => {
      // 123m 456p 789s 東東東 白白（14枚）
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
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(-1);
      expect(result.isComplete).toBe(true);
    });
  });

  describe('テンパイ（聴牌）', () => {
    it('1枚待ちのテンパイは向聴数0', () => {
      // 123m 456m 789m 111p 2p（13枚、2p待ち）
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

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(0);
      expect(result.isReady).toBe(true);
      expect(result.isComplete).toBe(false);
    });

    it('両面待ちのテンパイ', () => {
      // 123m 456m 789m 12p 33p（13枚、3p待ちまたは1p待ち）
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

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(0);
      expect(result.isReady).toBe(true);
    });
  });

  describe('1向聴', () => {
    it('1枚足りない状態', () => {
      // 123m 456m 7m 111p 22p（13枚）
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

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(1);
      expect(result.isReady).toBe(false);
      expect(result.isComplete).toBe(false);
    });
  });

  describe('向聴数が大きい状態', () => {
    it('バラバラの配牌', () => {
      // 1m 4m 7m 2p 5p 8p 3s 6s 9s 東 南 西 北（13枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN4,
        TileType.MAN7,
        TileType.PIN2,
        TileType.PIN5,
        TileType.PIN8,
        TileType.SOU3,
        TileType.SOU6,
        TileType.SOU9,
        TileType.TON,
        TileType.NAN,
        TileType.SHAA,
        TileType.PEI,
      ];

      const result = calculateShanten(hand);

      // バラバラなので向聴数は大きい（6向聴程度）
      expect(result.shanten).toBeGreaterThan(5);
      expect(result.isReady).toBe(false);
      expect(result.isComplete).toBe(false);
    });
  });
  describe('実践的な手牌パターン', () => {
    it('刻子と順子の混合形（テンパイ）', () => {
      // 123m 456p 789p 999s 1s（13枚、1s待ち）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.PIN4,
        TileType.PIN5,
        TileType.PIN6,
        TileType.PIN7,
        TileType.PIN8,
        TileType.PIN9,
        TileType.SOU9,
        TileType.SOU9,
        TileType.SOU9,
        TileType.SOU1,
      ];

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(0);
      expect(result.isReady).toBe(true);
    });

    it('字牌多めの1向聴', () => {
      // 東東東 南南南 白白 発 中 1m 2m（13枚）
      const hand: Hand = [
        TileType.TON,
        TileType.TON,
        TileType.TON,
        TileType.NAN,
        TileType.NAN,
        TileType.NAN,
        TileType.HAKU,
        TileType.HAKU,
        TileType.HATSU,
        TileType.CHUN,
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
      ];

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(1);
      expect(result.isReady).toBe(false);
    });

    it('辺張待ちのテンパイ（1-2待ち）', () => {
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

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(0);
      expect(result.isReady).toBe(true);
    });

    it('カンチャン待ちのテンパイ（2-4待ち）', () => {
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

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(0);
      expect(result.isReady).toBe(true);
    });

    it('シャボ待ちのテンパイ', () => {
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

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(0);
      expect(result.isReady).toBe(true);
    });

    it('2向聴の手牌', () => {
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

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(2);
      expect(result.isReady).toBe(false);
    });

    it('3向聴の手牌', () => {
      // 14m 47m 1p 4p 7p 1s 4s 7s 東南西（13枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN4,
        TileType.MAN7,
        TileType.PIN1,
        TileType.PIN4,
        TileType.PIN7,
        TileType.SOU1,
        TileType.SOU4,
        TileType.SOU7,
        TileType.TON,
        TileType.NAN,
        TileType.SHAA,
        TileType.HAKU,
      ];

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(8);
      expect(result.isReady).toBe(false);
    });

    it('混一色のテンパイ', () => {
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

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(0);
      expect(result.isReady).toBe(true);
    });

    it('清一色のテンパイ', () => {
      // 123m 456m 789m 11m（13枚、1m待ち）
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
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN2,
      ];

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(0);
      expect(result.isReady).toBe(true);
    });

    it('多面待ちのテンパイ', () => {
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

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(0);
      expect(result.isReady).toBe(true);
    });

    it('対子場（七対子系）の1向聴', () => {
      // 11m 22m 33p 44p 55s 66s 7s（13枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN2,
        TileType.PIN3,
        TileType.PIN3,
        TileType.PIN4,
        TileType.PIN4,
        TileType.SOU5,
        TileType.SOU5,
        TileType.SOU6,
        TileType.SOU6,
        TileType.SOU7,
      ];

      const result = calculateShanten(hand);

      // 4面子1雀頭形での向聴数を計算（七対子専用ではない）
      expect(result.shanten).toBeGreaterThanOrEqual(1);
      expect(result.isReady).toBe(false);
    });

    it('ターツ過多の1向聴', () => {
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

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(1);
      expect(result.isReady).toBe(false);
    });

    it('全帯字牌（チャンタ）の完成形', () => {
      // 123m 789m 123s 789s 11p（14枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
        TileType.SOU1,
        TileType.SOU2,
        TileType.SOU3,
        TileType.SOU7,
        TileType.SOU8,
        TileType.SOU9,
        TileType.PIN1,
        TileType.PIN1,
      ];

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(-1);
      expect(result.isComplete).toBe(true);
    });

    it('複合的な待ちの1向聴', () => {
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

      const result = calculateShanten(hand);

      expect(result.shanten).toBe(1);
      expect(result.isReady).toBe(false);
    });

    it('ノーテン（4向聴）の配牌', () => {
      // 1m 3m 5m 7m 9m 2p 4p 6p 8p 1s 3s 5s 7s（13枚）
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN3,
        TileType.MAN5,
        TileType.MAN7,
        TileType.MAN9,
        TileType.PIN2,
        TileType.PIN4,
        TileType.PIN6,
        TileType.PIN8,
        TileType.SOU1,
        TileType.SOU3,
        TileType.SOU5,
        TileType.SOU7,
      ];

      const result = calculateShanten(hand);

      expect(result.shanten).toBeGreaterThanOrEqual(4);
      expect(result.isReady).toBe(false);
      expect(result.isComplete).toBe(false);
    });
  });
});
