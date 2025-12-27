/**
 * Hand型のテスト
 * 麻雀の手牌を表すHand型の動作を検証
 */

import { TileType } from '@/lib/tiles';
import {
  type Hand,
  createHand,
  addTile,
  removeTile,
  validateHand,
  sortHand,
  countTile,
} from '@/lib/hand';

describe('Hand型', () => {
  describe('createHand', () => {
    it('空の手牌を作成できる', () => {
      // Arrange & Act
      const hand = createHand();

      // Assert
      expect(hand).toEqual([]);
      expect(hand).toHaveLength(0);
    });
  });

  describe('addTile', () => {
    it('空の手牌に牌を追加できる', () => {
      // Arrange
      const hand = createHand();

      // Act
      const result = addTile(hand, TileType.MAN1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.hand).toEqual([TileType.MAN1]);
      expect(result.error).toBeUndefined();
    });

    it('既存の手牌に牌を追加できる', () => {
      // Arrange
      const hand: Hand = [TileType.MAN1, TileType.MAN2];

      // Act
      const result = addTile(hand, TileType.MAN3);

      // Assert
      expect(result.success).toBe(true);
      expect(result.hand).toEqual([
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
      ]);
      expect(result.hand).toHaveLength(3);
    });

    it('元の手牌は変更されない（イミュータブル）', () => {
      // Arrange
      const hand: Hand = [TileType.MAN1];

      // Act
      addTile(hand, TileType.MAN2);

      // Assert
      expect(hand).toEqual([TileType.MAN1]);
    });

    it('13枚の手牌に14枚目を追加できる（ツモ時）', () => {
      // Arrange
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN3,
        TileType.SOU1,
        TileType.SOU2,
        TileType.SOU3,
        TileType.TON,
        TileType.NAN,
        TileType.SHAA,
        TileType.PEI,
      ];

      // Act
      const result = addTile(hand, TileType.HAKU);

      // Assert
      expect(result.success).toBe(true);
      expect(result.hand).toHaveLength(14);
    });

    it('14枚の手牌には追加できない（上限）', () => {
      // Arrange
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN3,
        TileType.SOU1,
        TileType.SOU2,
        TileType.SOU3,
        TileType.TON,
        TileType.NAN,
        TileType.SHAA,
        TileType.PEI,
        TileType.HAKU,
      ];

      // Act
      const result = addTile(hand, TileType.HATSU);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('上限');
      expect(result.hand).toBeUndefined();
    });

    it('同じ牌を4枚まで追加できる', () => {
      // Arrange
      let hand = createHand();

      // Act & Assert
      for (let i = 0; i < 4; i++) {
        const result = addTile(hand, TileType.MAN1);
        expect(result.success).toBe(true);
        hand = result.hand!;
      }

      expect(hand).toHaveLength(4);
      expect(hand.filter((t) => t === TileType.MAN1)).toHaveLength(4);
    });

    it('同じ牌を5枚目は追加できない', () => {
      // Arrange
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
      ];

      // Act
      const result = addTile(hand, TileType.MAN1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('4枚まで');
      expect(result.hand).toBeUndefined();
    });

    it('無効な牌（BACK）は追加できない', () => {
      // Arrange
      const hand = createHand();

      // Act
      const result = addTile(hand, TileType.BACK);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('無効な牌');
      expect(result.hand).toBeUndefined();
    });

    it('無効な牌（FRONT）は追加できない', () => {
      // Arrange
      const hand = createHand();

      // Act
      const result = addTile(hand, TileType.FRONT);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('無効な牌');
    });

    it('赤ドラ牌は追加できる', () => {
      // Arrange
      const hand = createHand();

      // Act
      const result = addTile(hand, TileType.MAN5_DORA);

      // Assert
      expect(result.success).toBe(true);
      expect(result.hand).toEqual([TileType.MAN5_DORA]);
    });
  });

  describe('removeTile', () => {
    it('手牌から牌を削除できる', () => {
      // Arrange
      const hand: Hand = [TileType.MAN1, TileType.MAN2, TileType.MAN3];

      // Act
      const result = removeTile(hand, TileType.MAN2);

      // Assert
      expect(result.success).toBe(true);
      expect(result.hand).toEqual([TileType.MAN1, TileType.MAN3]);
    });

    it('元の手牌は変更されない（イミュータブル）', () => {
      // Arrange
      const hand: Hand = [TileType.MAN1, TileType.MAN2];

      // Act
      removeTile(hand, TileType.MAN1);

      // Assert
      expect(hand).toEqual([TileType.MAN1, TileType.MAN2]);
    });

    it('同じ牌が複数ある場合は最初の1枚のみ削除される', () => {
      // Arrange
      const hand: Hand = [TileType.MAN1, TileType.MAN1, TileType.MAN2];

      // Act
      const result = removeTile(hand, TileType.MAN1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.hand).toEqual([TileType.MAN1, TileType.MAN2]);
      expect(result.hand).toHaveLength(2);
    });

    it('存在しない牌は削除できない', () => {
      // Arrange
      const hand: Hand = [TileType.MAN1, TileType.MAN2];

      // Act
      const result = removeTile(hand, TileType.MAN9);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('存在しません');
      expect(result.hand).toBeUndefined();
    });

    it('空の手牌から牌を削除しようとするとエラー', () => {
      // Arrange
      const hand = createHand();

      // Act
      const result = removeTile(hand, TileType.MAN1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('存在しません');
    });
  });

  describe('validateHand', () => {
    it('空の手牌は有効', () => {
      // Arrange
      const hand = createHand();

      // Act
      const result = validateHand(hand);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('13枚の正しい手牌は有効', () => {
      // Arrange
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN3,
        TileType.SOU1,
        TileType.SOU2,
        TileType.SOU3,
        TileType.TON,
        TileType.TON,
        TileType.NAN,
        TileType.NAN,
      ];

      // Act
      const result = validateHand(hand);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('14枚の手牌は有効（ツモ時）', () => {
      // Arrange
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN3,
        TileType.SOU1,
        TileType.SOU2,
        TileType.SOU3,
        TileType.TON,
        TileType.TON,
        TileType.NAN,
        TileType.NAN,
        TileType.SHAA,
      ];

      // Act
      const result = validateHand(hand);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('15枚以上の手牌は無効', () => {
      // Arrange
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN3,
        TileType.SOU1,
        TileType.SOU2,
        TileType.SOU3,
        TileType.TON,
        TileType.TON,
        TileType.NAN,
        TileType.NAN,
        TileType.SHAA,
        TileType.PEI,
      ];

      // Act
      const result = validateHand(hand);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('多すぎます'))).toBe(true);
    });

    it('同じ牌が5枚以上ある手牌は無効', () => {
      // Arrange
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
      ];

      // Act
      const result = validateHand(hand);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('4枚を超えて'))).toBe(true);
    });

    it('無効な牌（BACK）が含まれる手牌は無効', () => {
      // Arrange
      const hand: Hand = [TileType.MAN1, TileType.BACK];

      // Act
      const result = validateHand(hand);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('無効な牌'))).toBe(true);
    });

    it('複数のエラーをすべて検出できる', () => {
      // Arrange
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1, // 5枚
        TileType.BACK, // 無効な牌
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN3,
        TileType.SOU1,
        TileType.SOU2,
        TileType.SOU3,
        TileType.TON,
        TileType.NAN,
        TileType.SHAA, // 15枚
      ];

      // Act
      const result = validateHand(hand);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
      expect(result.errors.some((e) => e.includes('多すぎます'))).toBe(true);
      expect(result.errors.some((e) => e.includes('無効な牌'))).toBe(true);
    });

    it('赤ドラ牌を含む手牌は有効', () => {
      // Arrange
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN5_DORA,
        TileType.PIN5_DORA,
        TileType.SOU5_DORA,
      ];

      // Act
      const result = validateHand(hand);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('sortHand', () => {
    it('萬子→筒子→索子→字牌の順でソートされる', () => {
      // Arrange
      const hand: Hand = [
        TileType.CHUN, // 字牌
        TileType.SOU1, // 索子
        TileType.PIN1, // 筒子
        TileType.MAN1, // 萬子
      ];

      // Act
      const sorted = sortHand(hand);

      // Assert
      expect(sorted).toEqual([
        TileType.MAN1,
        TileType.PIN1,
        TileType.SOU1,
        TileType.CHUN,
      ]);
    });

    it('同じ種類の牌は数字順でソートされる', () => {
      // Arrange
      const hand: Hand = [
        TileType.MAN9,
        TileType.MAN1,
        TileType.MAN5,
        TileType.MAN3,
      ];

      // Act
      const sorted = sortHand(hand);

      // Assert
      expect(sorted).toEqual([
        TileType.MAN1,
        TileType.MAN3,
        TileType.MAN5,
        TileType.MAN9,
      ]);
    });

    it('字牌は東南西北白發中の順でソートされる', () => {
      // Arrange
      const hand: Hand = [
        TileType.CHUN,
        TileType.HAKU,
        TileType.PEI,
        TileType.NAN,
        TileType.HATSU,
        TileType.SHAA,
        TileType.TON,
      ];

      // Act
      const sorted = sortHand(hand);

      // Assert
      expect(sorted).toEqual([
        TileType.TON,
        TileType.NAN,
        TileType.SHAA,
        TileType.PEI,
        TileType.HAKU,
        TileType.HATSU,
        TileType.CHUN,
      ]);
    });

    it('複雑な手牌を正しくソートできる', () => {
      // Arrange
      const hand: Hand = [
        TileType.CHUN,
        TileType.SOU3,
        TileType.PIN2,
        TileType.MAN1,
        TileType.TON,
        TileType.SOU1,
        TileType.PIN9,
        TileType.MAN5,
        TileType.HAKU,
        TileType.SOU2,
        TileType.PIN1,
        TileType.MAN9,
        TileType.NAN,
      ];

      // Act
      const sorted = sortHand(hand);

      // Assert
      expect(sorted).toEqual([
        TileType.MAN1,
        TileType.MAN5,
        TileType.MAN9,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN9,
        TileType.SOU1,
        TileType.SOU2,
        TileType.SOU3,
        TileType.TON,
        TileType.NAN,
        TileType.HAKU,
        TileType.CHUN,
      ]);
    });

    it('元の手牌は変更されない（イミュータブル）', () => {
      // Arrange
      const hand: Hand = [TileType.MAN9, TileType.MAN1];

      // Act
      sortHand(hand);

      // Assert
      expect(hand).toEqual([TileType.MAN9, TileType.MAN1]);
    });

    it('空の手牌をソートしても空配列', () => {
      // Arrange
      const hand = createHand();

      // Act
      const sorted = sortHand(hand);

      // Assert
      expect(sorted).toEqual([]);
    });

    it('赤ドラ牌は通常の5と同じ位置にソートされる', () => {
      // Arrange
      const hand: Hand = [
        TileType.MAN6,
        TileType.MAN5_DORA,
        TileType.MAN4,
        TileType.PIN5_DORA,
        TileType.PIN4,
        TileType.SOU5_DORA,
        TileType.SOU4,
      ];

      // Act
      const sorted = sortHand(hand);

      // Assert
      expect(sorted).toEqual([
        TileType.MAN4,
        TileType.MAN5_DORA,
        TileType.MAN6,
        TileType.PIN4,
        TileType.PIN5_DORA,
        TileType.SOU4,
        TileType.SOU5_DORA,
      ]);
    });
  });

  describe('countTile', () => {
    it('空の手牌では0を返す', () => {
      // Arrange
      const hand = createHand();

      // Act
      const count = countTile(hand, TileType.MAN1);

      // Assert
      expect(count).toBe(0);
    });

    it('1枚の牌を正しくカウントできる', () => {
      // Arrange
      const hand: Hand = [TileType.MAN1, TileType.MAN2, TileType.MAN3];

      // Act
      const count = countTile(hand, TileType.MAN1);

      // Assert
      expect(count).toBe(1);
    });

    it('複数枚の同じ牌を正しくカウントできる', () => {
      // Arrange
      const hand: Hand = [
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN2,
      ];

      // Act
      const count = countTile(hand, TileType.MAN1);

      // Assert
      expect(count).toBe(3);
    });

    it('存在しない牌は0を返す', () => {
      // Arrange
      const hand: Hand = [TileType.MAN1, TileType.MAN2];

      // Act
      const count = countTile(hand, TileType.MAN9);

      // Assert
      expect(count).toBe(0);
    });

    it('4枚の同じ牌を正しくカウントできる', () => {
      // Arrange
      const hand: Hand = [
        TileType.TON,
        TileType.TON,
        TileType.TON,
        TileType.TON,
      ];

      // Act
      const count = countTile(hand, TileType.TON);

      // Assert
      expect(count).toBe(4);
    });
  });
});
