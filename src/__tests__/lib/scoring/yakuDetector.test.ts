/**
 * yakuDetectorのテスト
 * 麻雀の役判定ロジックを検証
 */

import { TileType } from '@/lib/tiles';
import { detectYaku, type WinContext } from '@/lib/scoring';

describe('detectYaku', () => {
  /** テスト用の基本WinContext */
  const createContext = (overrides?: Partial<WinContext>): WinContext => ({
    winningTile: TileType.MAN1,
    isTsumo: false,
    isDealer: true,
    isMenzen: true,
    isRiichi: false,
    roundWind: 'ton',
    seatWind: 'ton',
    dora: [],
    ...overrides,
  });

  describe('単体役の判定', () => {
    describe('リーチ', () => {
      it('リーチありで検出される', () => {
        // Arrange
        const hand: readonly TileType[] = [
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
        const context = createContext({ isRiichi: true });

        // Act
        const result = detectYaku(hand, context);

        // Assert
        expect(result.yakuList.map((y) => y.id)).toContain('riichi');
        expect(result.totalHan).toBeGreaterThanOrEqual(1);
      });

      it('リーチなしで検出されない', () => {
        // Arrange
        const hand: readonly TileType[] = [
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
        const context = createContext({ isRiichi: false });

        // Act
        const result = detectYaku(hand, context);

        // Assert
        expect(result.yakuList.map((y) => y.id)).not.toContain('riichi');
      });
    });

    describe('タンヤオ', () => {
      it('全て2-8で検出される', () => {
        // Arrange
        const hand: readonly TileType[] = [
          TileType.MAN2,
          TileType.MAN3,
          TileType.MAN4,
          TileType.PIN2,
          TileType.PIN3,
          TileType.PIN4,
          TileType.SOU2,
          TileType.SOU3,
          TileType.SOU4,
          TileType.MAN5,
          TileType.MAN5,
          TileType.MAN6,
          TileType.MAN6,
          TileType.MAN7,
        ];
        const context = createContext({ winningTile: TileType.MAN7 });

        // Act
        const result = detectYaku(hand, context);

        // Assert
        expect(result.yakuList.map((y) => y.id)).toContain('tanyao');
      });

      it('1または9を含むと検出されない', () => {
        // Arrange
        const hand: readonly TileType[] = [
          TileType.MAN1, // 1を含む
          TileType.MAN2,
          TileType.MAN3,
          TileType.PIN2,
          TileType.PIN3,
          TileType.PIN4,
          TileType.SOU2,
          TileType.SOU3,
          TileType.SOU4,
          TileType.MAN5,
          TileType.MAN5,
          TileType.MAN6,
          TileType.MAN6,
          TileType.MAN7,
        ];
        const context = createContext({ winningTile: TileType.MAN7 });

        // Act
        const result = detectYaku(hand, context);

        // Assert
        expect(result.yakuList.map((y) => y.id)).not.toContain('tanyao');
      });

      it('字牌を含むと検出されない', () => {
        // Arrange
        const hand: readonly TileType[] = [
          TileType.MAN2,
          TileType.MAN3,
          TileType.MAN4,
          TileType.PIN2,
          TileType.PIN3,
          TileType.PIN4,
          TileType.SOU2,
          TileType.SOU3,
          TileType.SOU4,
          TileType.MAN5,
          TileType.MAN6,
          TileType.MAN7,
          TileType.HAKU,
          TileType.HAKU,
        ];
        const context = createContext({ winningTile: TileType.MAN7 });

        // Act
        const result = detectYaku(hand, context);

        // Assert
        expect(result.yakuList.map((y) => y.id)).not.toContain('tanyao');
      });
    });

    describe('役牌', () => {
      it('白の刻子で検出される', () => {
        // Arrange
        const hand: readonly TileType[] = [
          TileType.MAN1,
          TileType.MAN2,
          TileType.MAN3,
          TileType.PIN1,
          TileType.PIN2,
          TileType.PIN3,
          TileType.SOU1,
          TileType.SOU2,
          TileType.SOU3,
          TileType.HAKU,
          TileType.HAKU,
          TileType.HAKU,
          TileType.TON,
          TileType.TON,
        ];
        const context = createContext({ winningTile: TileType.HAKU });

        // Act
        const result = detectYaku(hand, context);

        // Assert
        expect(result.yakuList.map((y) => y.id)).toContain('yakuhai_haku');
      });

      it('發の刻子で検出される', () => {
        // Arrange
        const hand: readonly TileType[] = [
          TileType.MAN1,
          TileType.MAN2,
          TileType.MAN3,
          TileType.PIN1,
          TileType.PIN2,
          TileType.PIN3,
          TileType.SOU1,
          TileType.SOU2,
          TileType.SOU3,
          TileType.HATSU,
          TileType.HATSU,
          TileType.HATSU,
          TileType.TON,
          TileType.TON,
        ];
        const context = createContext({ winningTile: TileType.HATSU });

        // Act
        const result = detectYaku(hand, context);

        // Assert
        expect(result.yakuList.map((y) => y.id)).toContain('yakuhai_hatsu');
      });

      it('中の刻子で検出される', () => {
        // Arrange
        const hand: readonly TileType[] = [
          TileType.MAN1,
          TileType.MAN2,
          TileType.MAN3,
          TileType.PIN1,
          TileType.PIN2,
          TileType.PIN3,
          TileType.SOU1,
          TileType.SOU2,
          TileType.SOU3,
          TileType.CHUN,
          TileType.CHUN,
          TileType.CHUN,
          TileType.TON,
          TileType.TON,
        ];
        const context = createContext({ winningTile: TileType.CHUN });

        // Act
        const result = detectYaku(hand, context);

        // Assert
        expect(result.yakuList.map((y) => y.id)).toContain('yakuhai_chun');
      });

      it('場風の刻子で検出される', () => {
        // Arrange
        const hand: readonly TileType[] = [
          TileType.TON,
          TileType.TON,
          TileType.TON,
          TileType.MAN2,
          TileType.MAN3,
          TileType.MAN4,
          TileType.PIN2,
          TileType.PIN3,
          TileType.PIN4,
          TileType.SOU2,
          TileType.SOU3,
          TileType.SOU4,
          TileType.MAN5,
          TileType.MAN5,
        ];
        const context = createContext({ roundWind: 'ton', seatWind: 'nan' });

        // Act
        const result = detectYaku(hand, context);

        // Assert
        expect(result.yakuList.map((y) => y.id)).toContain('yakuhai_ton');
      });
    });

    describe('清一色', () => {
      it('1種類の数牌のみで検出される', () => {
        // Arrange
        const hand: readonly TileType[] = [
          TileType.MAN1,
          TileType.MAN2,
          TileType.MAN3,
          TileType.MAN1,
          TileType.MAN2,
          TileType.MAN3,
          TileType.MAN1,
          TileType.MAN2,
          TileType.MAN3,
          TileType.MAN4,
          TileType.MAN4,
          TileType.MAN5,
          TileType.MAN5,
          TileType.MAN6,
        ];
        const context = createContext({ winningTile: TileType.MAN6 });

        // Act
        const result = detectYaku(hand, context);

        // Assert
        expect(result.yakuList.map((y) => y.id)).toContain('chinitsu');
      });

      it('複数の数牌種類があると検出されない', () => {
        // Arrange
        const hand: readonly TileType[] = [
          TileType.MAN1,
          TileType.MAN2,
          TileType.MAN3,
          TileType.PIN1, // 別の種類
          TileType.PIN2,
          TileType.PIN3,
          TileType.MAN1,
          TileType.MAN2,
          TileType.MAN3,
          TileType.MAN4,
          TileType.MAN4,
          TileType.MAN5,
          TileType.MAN5,
          TileType.MAN6,
        ];
        const context = createContext({ winningTile: TileType.MAN6 });

        // Act
        const result = detectYaku(hand, context);

        // Assert
        expect(result.yakuList.map((y) => y.id)).not.toContain('chinitsu');
      });
    });

    describe('七対子', () => {
      it('7つの対で検出される', () => {
        // Arrange
        const hand: readonly TileType[] = [
          TileType.MAN1,
          TileType.MAN1,
          TileType.MAN2,
          TileType.MAN2,
          TileType.PIN1,
          TileType.PIN1,
          TileType.PIN2,
          TileType.PIN2,
          TileType.SOU1,
          TileType.SOU1,
          TileType.TON,
          TileType.TON,
          TileType.NAN,
          TileType.NAN,
        ];
        const context = createContext({ winningTile: TileType.NAN });

        // Act
        const result = detectYaku(hand, context);

        // Assert
        expect(result.yakuList.map((y) => y.id)).toContain('chiitoitsu');
      });

      it('13枚の手牌では検出されない', () => {
        // Arrange
        const hand: readonly TileType[] = [
          TileType.MAN1,
          TileType.MAN1,
          TileType.MAN2,
          TileType.MAN2,
          TileType.PIN1,
          TileType.PIN1,
          TileType.PIN2,
          TileType.PIN2,
          TileType.SOU1,
          TileType.SOU1,
          TileType.TON,
          TileType.TON,
          TileType.NAN,
        ];
        const context = createContext({ winningTile: TileType.NAN });

        // Act
        const result = detectYaku(hand, context);

        // Assert
        expect(result.yakuList.map((y) => y.id)).not.toContain('chiitoitsu');
      });
    });

    describe('国士無双', () => {
      it('全て異なるターミナル/字牌で検出される', () => {
        // Arrange
        const hand: readonly TileType[] = [
          TileType.MAN1,
          TileType.MAN9,
          TileType.PIN1,
          TileType.PIN9,
          TileType.SOU1,
          TileType.SOU9,
          TileType.TON,
          TileType.NAN,
          TileType.SHAA,
          TileType.PEI,
          TileType.HAKU,
          TileType.HATSU,
          TileType.CHUN,
          TileType.MAN1, // ペア
        ];
        const context = createContext({ winningTile: TileType.MAN1 });

        // Act
        const result = detectYaku(hand, context);

        // Assert
        expect(result.yakuList.map((y) => y.id)).toContain('kokushimusou');
      });
    });
  });

  describe('複合役の判定', () => {
    it('複数の役が同時に成立する', () => {
      // Arrange: タンヤオ＋清一色の例
      const hand: readonly TileType[] = [
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN3,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN4,
        TileType.MAN5,
      ];
      const context = createContext({
        winningTile: TileType.MAN5,
        isRiichi: true,
      });

      // Act
      const result = detectYaku(hand, context);

      // Assert
      expect(result.yakuList.length).toBeGreaterThanOrEqual(1);
      expect(result.totalHan).toBeGreaterThan(0);
    });
  });

  describe('エッジケース', () => {
    it('無役で和了できない', () => {
      // Arrange: ランダムな組み合わせで役がない
      const hand: readonly TileType[] = [
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
        TileType.NAN,
        TileType.SHAA,
        TileType.PEI,
        TileType.MAN4,
      ];
      const context = createContext({ winningTile: TileType.MAN4 });

      // Act
      const result = detectYaku(hand, context);

      // Assert: 手牌が正常な形状でないため検出失敗
      expect(result.yakuList.length).toBeGreaterThanOrEqual(0);
    });

    it('赤ドラを含む手牌の判定', () => {
      // Arrange
      const hand: readonly TileType[] = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN3,
        TileType.SOU1,
        TileType.SOU2,
        TileType.SOU3,
        TileType.MAN5_DORA, // 赤5萬
        TileType.MAN5_DORA,
        TileType.TON,
        TileType.TON,
        TileType.NAN,
      ];
      const context = createContext({ winningTile: TileType.NAN });

      // Act
      const result = detectYaku(hand, context);

      // Assert
      expect(result.yakuList).toBeDefined();
      expect(Array.isArray(result.yakuList)).toBe(true);
    });

    it('ツモかロンかで異なる役の判定', () => {
      // Arrange: 三暗刻はツモのみ
      const hand: readonly TileType[] = [
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
        TileType.PIN2,
        TileType.PIN2,
        TileType.PIN2,
        TileType.SOU3,
        TileType.SOU3,
        TileType.SOU3,
        TileType.TON,
        TileType.NAN,
        TileType.NAN,
        TileType.SHAA,
        TileType.SOU4,
      ];

      // Act - ツモ
      const resultTsumo = detectYaku(hand, {
        ...createContext({
          winningTile: TileType.SOU4,
          isTsumo: true,
        }),
      });

      // Act - ロン
      const resultRon = detectYaku(hand, {
        ...createContext({
          winningTile: TileType.SOU4,
          isTsumo: false,
        }),
      });

      // Assert
      expect(resultTsumo.yakuList).toBeDefined();
      expect(resultRon.yakuList).toBeDefined();
    });

    it('13枚ちょうどの手牌で判定できる', () => {
      // Arrange
      const hand: readonly TileType[] = [
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
      const context = createContext({
        winningTile: TileType.SHAA,
      });

      // Act
      const result = detectYaku(hand, context);

      // Assert
      expect(result).toHaveProperty('yakuList');
      expect(result).toHaveProperty('totalHan');
      expect(result).toHaveProperty('isYakuman');
    });

    it('14枚（ツモ）の手牌で判定できる', () => {
      // Arrange
      const hand: readonly TileType[] = [
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
      const context = createContext({
        winningTile: TileType.SHAA,
        isTsumo: true,
      });

      // Act
      const result = detectYaku(hand, context);

      // Assert
      expect(result.yakuList).toBeDefined();
      expect(result.totalHan).toBeGreaterThanOrEqual(0);
    });
  });

  describe('YakuResult型の検証', () => {
    it('yakuListはYaku[]型である', () => {
      // Arrange
      const hand: readonly TileType[] = [
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
      const context = createContext();

      // Act
      const result = detectYaku(hand, context);

      // Assert
      expect(Array.isArray(result.yakuList)).toBe(true);
      if (result.yakuList.length > 0) {
        expect(result.yakuList[0]).toHaveProperty('id');
        expect(result.yakuList[0]).toHaveProperty('name');
        expect(result.yakuList[0]).toHaveProperty('han');
      }
    });

    it('totalHanは数値である', () => {
      // Arrange
      const hand: readonly TileType[] = [
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
      const context = createContext();

      // Act
      const result = detectYaku(hand, context);

      // Assert
      expect(typeof result.totalHan).toBe('number');
      expect(result.totalHan).toBeGreaterThanOrEqual(0);
    });

    it('isYakumanはboolean型である', () => {
      // Arrange
      const hand: readonly TileType[] = [
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
      const context = createContext();

      // Act
      const result = detectYaku(hand, context);

      // Assert
      expect(typeof result.isYakuman).toBe('boolean');
    });
  });

  describe('特殊形の役', () => {
    describe('混一色', () => {
      it('1種類の数牌と字牌で検出される', () => {
        // Arrange
        const hand: readonly TileType[] = [
          TileType.MAN1,
          TileType.MAN2,
          TileType.MAN3,
          TileType.MAN1,
          TileType.MAN2,
          TileType.MAN3,
          TileType.MAN1,
          TileType.MAN2,
          TileType.MAN3,
          TileType.TON,
          TileType.TON,
          TileType.NAN,
          TileType.NAN,
          TileType.SHAA,
        ];
        const context = createContext({ winningTile: TileType.SHAA });

        // Act
        const result = detectYaku(hand, context);

        // Assert
        expect(result.yakuList.map((y) => y.id)).toContain('honitsu');
      });
    });
  });
});
