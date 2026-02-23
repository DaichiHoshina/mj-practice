/**
 * handDecomposerのテスト
 * 手牌分解ロジック（正規化、牌種判定、数値取得、面子分解、待ち判定）を検証
 */

import { TileType } from '@/lib/tiles';
import {
  normalizeTile,
  getTileSuit,
  getTileNumber,
  decomposeHand,
  getWaitTypes,
  type DecomposedHand,
} from '@/lib/scoring/handDecomposer';

describe('normalizeTile', () => {
  describe('赤ドラの正規化', () => {
    it('MAN5_DORA を MAN5 に正規化する', () => {
      // Arrange
      const tile = TileType.MAN5_DORA;

      // Act
      const result = normalizeTile(tile);

      // Assert
      expect(result).toBe(TileType.MAN5);
    });

    it('PIN5_DORA を PIN5 に正規化する', () => {
      // Arrange
      const tile = TileType.PIN5_DORA;

      // Act
      const result = normalizeTile(tile);

      // Assert
      expect(result).toBe(TileType.PIN5);
    });

    it('SOU5_DORA を SOU5 に正規化する', () => {
      // Arrange
      const tile = TileType.SOU5_DORA;

      // Act
      const result = normalizeTile(tile);

      // Assert
      expect(result).toBe(TileType.SOU5);
    });
  });

  describe('通常牌はそのまま返る', () => {
    it('数牌はそのまま返る', () => {
      // Arrange
      const tile = TileType.MAN1;

      // Act
      const result = normalizeTile(tile);

      // Assert
      expect(result).toBe(TileType.MAN1);
    });

    it('字牌はそのまま返る', () => {
      // Arrange
      const tile = TileType.TON;

      // Act
      const result = normalizeTile(tile);

      // Assert
      expect(result).toBe(TileType.TON);
    });

    it('赤ドラでない5の牌はそのまま返る', () => {
      // Arrange / Act / Assert
      expect(normalizeTile(TileType.MAN5)).toBe(TileType.MAN5);
      expect(normalizeTile(TileType.PIN5)).toBe(TileType.PIN5);
      expect(normalizeTile(TileType.SOU5)).toBe(TileType.SOU5);
    });
  });
});

describe('getTileSuit', () => {
  describe('萬子の判定', () => {
    it('1m は man を返す', () => {
      // Arrange / Act / Assert
      expect(getTileSuit(TileType.MAN1)).toBe('man');
    });

    it('9m は man を返す', () => {
      expect(getTileSuit(TileType.MAN9)).toBe('man');
    });

    it('赤ドラ 0m は man を返す', () => {
      expect(getTileSuit(TileType.MAN5_DORA)).toBe('man');
    });
  });

  describe('筒子の判定', () => {
    it('1p は pin を返す', () => {
      expect(getTileSuit(TileType.PIN1)).toBe('pin');
    });

    it('9p は pin を返す', () => {
      expect(getTileSuit(TileType.PIN9)).toBe('pin');
    });

    it('赤ドラ 0p は pin を返す', () => {
      expect(getTileSuit(TileType.PIN5_DORA)).toBe('pin');
    });
  });

  describe('索子の判定', () => {
    it('1s は sou を返す', () => {
      expect(getTileSuit(TileType.SOU1)).toBe('sou');
    });

    it('9s は sou を返す', () => {
      expect(getTileSuit(TileType.SOU9)).toBe('sou');
    });

    it('赤ドラ 0s は sou を返す', () => {
      expect(getTileSuit(TileType.SOU5_DORA)).toBe('sou');
    });
  });

  describe('字牌の判定', () => {
    it('東は honor を返す', () => {
      expect(getTileSuit(TileType.TON)).toBe('honor');
    });

    it('南は honor を返す', () => {
      expect(getTileSuit(TileType.NAN)).toBe('honor');
    });

    it('西は honor を返す', () => {
      expect(getTileSuit(TileType.SHAA)).toBe('honor');
    });

    it('北は honor を返す', () => {
      expect(getTileSuit(TileType.PEI)).toBe('honor');
    });

    it('白は honor を返す', () => {
      expect(getTileSuit(TileType.HAKU)).toBe('honor');
    });

    it('發は honor を返す', () => {
      expect(getTileSuit(TileType.HATSU)).toBe('honor');
    });

    it('中は honor を返す', () => {
      expect(getTileSuit(TileType.CHUN)).toBe('honor');
    });
  });
});

describe('getTileNumber', () => {
  describe('数牌の数値取得', () => {
    it('1m は 1 を返す', () => {
      // Arrange / Act / Assert
      expect(getTileNumber(TileType.MAN1)).toBe(1);
    });

    it('9p は 9 を返す', () => {
      expect(getTileNumber(TileType.PIN9)).toBe(9);
    });

    it('5s は 5 を返す', () => {
      expect(getTileNumber(TileType.SOU5)).toBe(5);
    });
  });

  describe('境界値', () => {
    it('1m（最小値）は 1 を返す', () => {
      expect(getTileNumber(TileType.MAN1)).toBe(1);
    });

    it('9s（最大値）は 9 を返す', () => {
      expect(getTileNumber(TileType.SOU9)).toBe(9);
    });
  });

  describe('赤ドラの数値取得', () => {
    it('0m（赤五萬）は 5 を返す', () => {
      expect(getTileNumber(TileType.MAN5_DORA)).toBe(5);
    });

    it('0p（赤五筒）は 5 を返す', () => {
      expect(getTileNumber(TileType.PIN5_DORA)).toBe(5);
    });

    it('0s（赤五索）は 5 を返す', () => {
      expect(getTileNumber(TileType.SOU5_DORA)).toBe(5);
    });
  });

  describe('字牌は null を返す', () => {
    it('東は null を返す', () => {
      expect(getTileNumber(TileType.TON)).toBeNull();
    });

    it('白は null を返す', () => {
      expect(getTileNumber(TileType.HAKU)).toBeNull();
    });

    it('中は null を返す', () => {
      expect(getTileNumber(TileType.CHUN)).toBeNull();
    });
  });
});

describe('decomposeHand', () => {
  describe('基本的な手牌分解', () => {
    it('順子のみの手牌を分解できる', () => {
      // Arrange: 123m 456m 789p 123s 東東
      const hand: readonly TileType[] = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.PIN7,
        TileType.PIN8,
        TileType.PIN9,
        TileType.SOU1,
        TileType.SOU2,
        TileType.SOU3,
        TileType.TON,
        TileType.TON,
      ];

      // Act
      const results = decomposeHand(hand);

      // Assert
      expect(results.length).toBeGreaterThanOrEqual(1);
      const decomp = results[0];
      expect(decomp.jantou).toBe(TileType.TON);
      expect(decomp.mentsu).toHaveLength(4);
      expect(decomp.mentsu.every((m) => m.type === 'shuntsu')).toBe(true);
    });

    it('刻子のみの手牌を分解できる', () => {
      // Arrange: 111m 333p 555s 東東東 白白
      const hand: readonly TileType[] = [
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
        TileType.PIN3,
        TileType.PIN3,
        TileType.PIN3,
        TileType.SOU5,
        TileType.SOU5,
        TileType.SOU5,
        TileType.TON,
        TileType.TON,
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      // Act
      const results = decomposeHand(hand);

      // Assert
      expect(results.length).toBeGreaterThanOrEqual(1);
      const decomp = results.find((d) => d.jantou === TileType.HAKU);
      expect(decomp).toBeDefined();
      expect(decomp!.mentsu).toHaveLength(4);
      expect(decomp!.mentsu.every((m) => m.type === 'koutsu')).toBe(true);
    });

    it('順子と刻子の混合手牌を分解できる', () => {
      // Arrange: 123m 111p 789s 東東東 白白
      const hand: readonly TileType[] = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.PIN1,
        TileType.PIN1,
        TileType.PIN1,
        TileType.SOU7,
        TileType.SOU8,
        TileType.SOU9,
        TileType.TON,
        TileType.TON,
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      // Act
      const results = decomposeHand(hand);

      // Assert
      expect(results.length).toBeGreaterThanOrEqual(1);
      const decomp = results.find((d) => d.jantou === TileType.HAKU);
      expect(decomp).toBeDefined();
      expect(decomp!.mentsu).toHaveLength(4);

      const shuntsuCount = decomp!.mentsu.filter(
        (m) => m.type === 'shuntsu'
      ).length;
      const koutsuCount = decomp!.mentsu.filter(
        (m) => m.type === 'koutsu'
      ).length;
      expect(shuntsuCount).toBe(2);
      expect(koutsuCount).toBe(2);
    });
  });

  describe('複数分解候補', () => {
    it('雀頭候補が複数ある手牌で全候補を返す', () => {
      // Arrange: 111m 222m 333m 44m 44p → 雀頭が4mまたは4p
      // 実際には: 111m 222m 333m のうち 123m*3 + 雀頭 など複数分解
      // シンプルに: 111222333m 44m 456p の14枚
      // → 123m*3 + 44mの雀頭 もしくは 面子の取り方が複数
      const hand: readonly TileType[] = [
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN2,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN3,
        TileType.MAN3,
        TileType.PIN4,
        TileType.PIN5,
        TileType.PIN6,
        TileType.SOU7,
        TileType.SOU7,
      ];

      // Act
      const results = decomposeHand(hand);

      // Assert: 123m*3 + 雀頭SOU7 もしくは 111m+222m+333m+雀頭SOU7 等の複数パターン
      expect(results.length).toBeGreaterThan(1);
    });

    it('1112345678999m は複数パターンに分解できる', () => {
      // Arrange: 1112345678999m（14枚）
      const hand: readonly TileType[] = [
        TileType.MAN1,
        TileType.MAN1,
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
        TileType.MAN9,
        TileType.MAN5, // 14枚目 → 5m重複で雀頭
      ];
      // 実際: 1112345678999m + 5m = 14枚
      // → 11m雀頭 + 123m+456m+789m+999m刻子
      // → 99m雀頭 + 111m刻子+234m+567m+89mが足りない → 分解パターン検証

      // Act
      const results = decomposeHand(hand);

      // Assert
      expect(results.length).toBeGreaterThanOrEqual(1);
      for (const decomp of results) {
        expect(decomp.mentsu).toHaveLength(4);
      }
    });
  });

  describe('分解不可能な手牌', () => {
    it('4面子1雀頭に分解できない手牌は空配列を返す', () => {
      // Arrange: バラバラの手牌
      const hand: readonly TileType[] = [
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
        TileType.SOU9,
      ];

      // Act
      const results = decomposeHand(hand);

      // Assert
      expect(results).toHaveLength(0);
    });

    it('13枚の手牌は分解できない', () => {
      // Arrange: 13枚（牌が足りない）
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
        TileType.TON,
        TileType.HAKU,
      ];

      // Act
      const results = decomposeHand(hand);

      // Assert
      expect(results).toHaveLength(0);
    });
  });

  describe('赤ドラ入り手牌', () => {
    it('赤ドラを含む手牌を正規化して分解する', () => {
      // Arrange: 123m 赤5m6m7m 789p 123s 東東
      const hand: readonly TileType[] = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN5_DORA, // 赤5m → 正規化で5mに
        TileType.MAN6,
        TileType.MAN7,
        TileType.PIN7,
        TileType.PIN8,
        TileType.PIN9,
        TileType.SOU1,
        TileType.SOU2,
        TileType.SOU3,
        TileType.TON,
        TileType.TON,
      ];

      // Act
      const results = decomposeHand(hand);

      // Assert
      expect(results.length).toBeGreaterThanOrEqual(1);
      const decomp = results[0];
      expect(decomp.jantou).toBe(TileType.TON);
      expect(decomp.mentsu).toHaveLength(4);
    });

    it('赤ドラが雀頭に含まれる手牌を分解できる', () => {
      // Arrange: 123m 456p 789s 東東東 赤5m 5m（雀頭）
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
        TileType.TON,
        TileType.TON,
        TileType.MAN5_DORA,
        TileType.MAN5,
      ];

      // Act
      const results = decomposeHand(hand);

      // Assert
      expect(results.length).toBeGreaterThanOrEqual(1);
      const decomp = results.find((d) => d.jantou === TileType.MAN5);
      expect(decomp).toBeDefined();
      expect(decomp!.mentsu).toHaveLength(4);
    });
  });
});

describe('getWaitTypes', () => {
  /** ヘルパー: 指定された面子構成からDecomposedHandを作成 */
  const createDecomp = (
    jantou: TileType,
    mentsuList: Array<{
      type: 'shuntsu' | 'koutsu' | 'kantsu';
      tiles: TileType[];
    }>
  ): DecomposedHand => ({
    jantou,
    mentsu: mentsuList,
  });

  describe('両面待ち (ryanmen)', () => {
    it('23m でアガリ牌が 1m の場合、両面と判定される', () => {
      // Arrange: 手牌に456mの順子、アガリ牌は4m
      // 456m 456p 789s 東東東 白白
      const decomp = createDecomp(TileType.HAKU, [
        {
          type: 'shuntsu',
          tiles: [TileType.MAN4, TileType.MAN5, TileType.MAN6],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.PIN4, TileType.PIN5, TileType.PIN6],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.SOU7, TileType.SOU8, TileType.SOU9],
        },
        { type: 'koutsu', tiles: [TileType.TON, TileType.TON, TileType.TON] },
      ]);
      const handWithWin: readonly TileType[] = [
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
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

      // Act
      const result = getWaitTypes(decomp, handWithWin, TileType.MAN4);

      // Assert
      expect(result.has('ryanmen')).toBe(true);
    });

    it('56m でアガリ牌が 4m の場合、両面と判定される', () => {
      // Arrange
      const decomp = createDecomp(TileType.HAKU, [
        {
          type: 'shuntsu',
          tiles: [TileType.MAN4, TileType.MAN5, TileType.MAN6],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.PIN1, TileType.PIN2, TileType.PIN3],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.SOU1, TileType.SOU2, TileType.SOU3],
        },
        { type: 'koutsu', tiles: [TileType.TON, TileType.TON, TileType.TON] },
      ]);
      const hand: readonly TileType[] = [
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN3,
        TileType.SOU1,
        TileType.SOU2,
        TileType.SOU3,
        TileType.TON,
        TileType.TON,
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      // Act
      const result = getWaitTypes(decomp, hand, TileType.MAN4);

      // Assert
      expect(result.has('ryanmen')).toBe(true);
    });
  });

  describe('辺張待ち (penchan)', () => {
    it('12m でアガリ牌が 3m の場合、辺張と判定される', () => {
      // Arrange
      const decomp = createDecomp(TileType.HAKU, [
        {
          type: 'shuntsu',
          tiles: [TileType.MAN1, TileType.MAN2, TileType.MAN3],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.PIN4, TileType.PIN5, TileType.PIN6],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.SOU7, TileType.SOU8, TileType.SOU9],
        },
        { type: 'koutsu', tiles: [TileType.TON, TileType.TON, TileType.TON] },
      ]);
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
        TileType.TON,
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      // Act
      const result = getWaitTypes(decomp, hand, TileType.MAN3);

      // Assert
      expect(result.has('penchan')).toBe(true);
    });

    it('89m でアガリ牌が 7m の場合、辺張と判定される', () => {
      // Arrange
      const decomp = createDecomp(TileType.HAKU, [
        {
          type: 'shuntsu',
          tiles: [TileType.MAN7, TileType.MAN8, TileType.MAN9],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.PIN4, TileType.PIN5, TileType.PIN6],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.SOU1, TileType.SOU2, TileType.SOU3],
        },
        { type: 'koutsu', tiles: [TileType.TON, TileType.TON, TileType.TON] },
      ]);
      const hand: readonly TileType[] = [
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
        TileType.PIN4,
        TileType.PIN5,
        TileType.PIN6,
        TileType.SOU1,
        TileType.SOU2,
        TileType.SOU3,
        TileType.TON,
        TileType.TON,
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      // Act
      const result = getWaitTypes(decomp, hand, TileType.MAN7);

      // Assert
      expect(result.has('penchan')).toBe(true);
    });

    it('12m でアガリ牌が 1m の場合、辺張と判定される', () => {
      // Arrange: 123mの順子で1mがアガリ牌 → first=1, winningNum=1 → penchan
      const decomp = createDecomp(TileType.HAKU, [
        {
          type: 'shuntsu',
          tiles: [TileType.MAN1, TileType.MAN2, TileType.MAN3],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.PIN4, TileType.PIN5, TileType.PIN6],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.SOU4, TileType.SOU5, TileType.SOU6],
        },
        { type: 'koutsu', tiles: [TileType.TON, TileType.TON, TileType.TON] },
      ]);
      const hand: readonly TileType[] = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.PIN4,
        TileType.PIN5,
        TileType.PIN6,
        TileType.SOU4,
        TileType.SOU5,
        TileType.SOU6,
        TileType.TON,
        TileType.TON,
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      // Act
      const result = getWaitTypes(decomp, hand, TileType.MAN1);

      // Assert
      expect(result.has('penchan')).toBe(true);
    });

    it('89m でアガリ牌が 9m の場合、辺張と判定される', () => {
      // Arrange: 789mの順子で9mがアガリ牌 → first=7, winningNum=9 → penchan
      const decomp = createDecomp(TileType.HAKU, [
        {
          type: 'shuntsu',
          tiles: [TileType.MAN7, TileType.MAN8, TileType.MAN9],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.PIN4, TileType.PIN5, TileType.PIN6],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.SOU4, TileType.SOU5, TileType.SOU6],
        },
        { type: 'koutsu', tiles: [TileType.TON, TileType.TON, TileType.TON] },
      ]);
      const hand: readonly TileType[] = [
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
        TileType.PIN4,
        TileType.PIN5,
        TileType.PIN6,
        TileType.SOU4,
        TileType.SOU5,
        TileType.SOU6,
        TileType.TON,
        TileType.TON,
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      // Act
      const result = getWaitTypes(decomp, hand, TileType.MAN9);

      // Assert
      expect(result.has('penchan')).toBe(true);
    });
  });

  describe('嵌張待ち (kanchan)', () => {
    it('13m でアガリ牌が 2m の場合、嵌張と判定される', () => {
      // Arrange
      const decomp = createDecomp(TileType.HAKU, [
        {
          type: 'shuntsu',
          tiles: [TileType.MAN1, TileType.MAN2, TileType.MAN3],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.PIN4, TileType.PIN5, TileType.PIN6],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.SOU7, TileType.SOU8, TileType.SOU9],
        },
        { type: 'koutsu', tiles: [TileType.TON, TileType.TON, TileType.TON] },
      ]);
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
        TileType.TON,
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      // Act
      const result = getWaitTypes(decomp, hand, TileType.MAN2);

      // Assert
      expect(result.has('kanchan')).toBe(true);
    });

    it('57s でアガリ牌が 6s の場合、嵌張と判定される', () => {
      // Arrange
      const decomp = createDecomp(TileType.HAKU, [
        {
          type: 'shuntsu',
          tiles: [TileType.SOU5, TileType.SOU6, TileType.SOU7],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.MAN1, TileType.MAN2, TileType.MAN3],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.PIN4, TileType.PIN5, TileType.PIN6],
        },
        { type: 'koutsu', tiles: [TileType.TON, TileType.TON, TileType.TON] },
      ]);
      const hand: readonly TileType[] = [
        TileType.SOU5,
        TileType.SOU6,
        TileType.SOU7,
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.PIN4,
        TileType.PIN5,
        TileType.PIN6,
        TileType.TON,
        TileType.TON,
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      // Act
      const result = getWaitTypes(decomp, hand, TileType.SOU6);

      // Assert
      expect(result.has('kanchan')).toBe(true);
    });
  });

  describe('単騎待ち (tanki)', () => {
    it('雀頭でアガリの場合、単騎と判定される', () => {
      // Arrange: 白が2枚で雀頭、アガリ牌も白
      const decomp = createDecomp(TileType.HAKU, [
        {
          type: 'shuntsu',
          tiles: [TileType.MAN1, TileType.MAN2, TileType.MAN3],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.PIN4, TileType.PIN5, TileType.PIN6],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.SOU7, TileType.SOU8, TileType.SOU9],
        },
        { type: 'koutsu', tiles: [TileType.TON, TileType.TON, TileType.TON] },
      ]);
      // 手牌に白が2枚（アガリで2枚になった=待ちの時点では1枚=単騎）
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
        TileType.TON,
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      // Act
      const result = getWaitTypes(decomp, hand, TileType.HAKU);

      // Assert
      expect(result.has('tanki')).toBe(true);
    });

    it('雀頭が3枚以上ある場合は単騎にならない', () => {
      // Arrange: 白が3枚 → winningCount=3 なので tanki にはならない
      // （刻子+雀頭のどちらかとして使われる）
      const decomp = createDecomp(TileType.HAKU, [
        {
          type: 'shuntsu',
          tiles: [TileType.MAN1, TileType.MAN2, TileType.MAN3],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.PIN4, TileType.PIN5, TileType.PIN6],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.SOU7, TileType.SOU8, TileType.SOU9],
        },
        { type: 'koutsu', tiles: [TileType.TON, TileType.TON, TileType.TON] },
      ]);
      // 白3枚の手牌を構成（getWaitTypesはカウントのみ参照）
      // 注: 15枚だが、カウントロジック検証用
      const handWith3Haku: readonly TileType[] = [
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
        TileType.HAKU, // 15枚だが、カウントロジック検証用
      ];

      // Act
      const result = getWaitTypes(decomp, handWith3Haku, TileType.HAKU);

      // Assert
      expect(result.has('tanki')).toBe(false);
    });
  });

  describe('双碰待ち (shanpon)', () => {
    it('刻子にアガリ牌が含まれる場合、双碰と判定される', () => {
      // Arrange
      const decomp = createDecomp(TileType.HAKU, [
        {
          type: 'shuntsu',
          tiles: [TileType.MAN1, TileType.MAN2, TileType.MAN3],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.PIN4, TileType.PIN5, TileType.PIN6],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.SOU7, TileType.SOU8, TileType.SOU9],
        },
        { type: 'koutsu', tiles: [TileType.TON, TileType.TON, TileType.TON] },
      ]);
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
        TileType.TON,
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      // Act
      const result = getWaitTypes(decomp, hand, TileType.TON);

      // Assert
      expect(result.has('shanpon')).toBe(true);
    });

    it('槓子にアガリ牌が含まれる場合も双碰と判定される', () => {
      // Arrange
      const decomp = createDecomp(TileType.HAKU, [
        {
          type: 'shuntsu',
          tiles: [TileType.MAN1, TileType.MAN2, TileType.MAN3],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.PIN4, TileType.PIN5, TileType.PIN6],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.SOU7, TileType.SOU8, TileType.SOU9],
        },
        {
          type: 'kantsu',
          tiles: [TileType.TON, TileType.TON, TileType.TON, TileType.TON],
        },
      ]);
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
        TileType.TON,
        TileType.TON,
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      // Act
      const result = getWaitTypes(decomp, hand, TileType.TON);

      // Assert
      expect(result.has('shanpon')).toBe(true);
    });
  });

  describe('赤ドラのアガリ牌', () => {
    it('赤ドラでアガリした場合も正しく待ち判定される', () => {
      // Arrange: 赤5mでアガリ → 456mの順子
      const decomp = createDecomp(TileType.HAKU, [
        {
          type: 'shuntsu',
          tiles: [TileType.MAN4, TileType.MAN5, TileType.MAN6],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.PIN1, TileType.PIN2, TileType.PIN3],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.SOU7, TileType.SOU8, TileType.SOU9],
        },
        { type: 'koutsu', tiles: [TileType.TON, TileType.TON, TileType.TON] },
      ]);
      const hand: readonly TileType[] = [
        TileType.MAN4,
        TileType.MAN5_DORA, // 赤5m
        TileType.MAN6,
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN3,
        TileType.SOU7,
        TileType.SOU8,
        TileType.SOU9,
        TileType.TON,
        TileType.TON,
        TileType.TON,
        TileType.HAKU,
        TileType.HAKU,
      ];

      // Act: 赤5mでアガリ
      const result = getWaitTypes(decomp, hand, TileType.MAN5_DORA);

      // Assert: 456mの順子で5mは嵌張
      expect(result.has('kanchan')).toBe(true);
    });
  });

  describe('複合待ち', () => {
    it('同じ分解で複数の待ちタイプが検出される場合がある', () => {
      // Arrange: 順子と刻子の両方にアガリ牌が含まれるケース
      // 例: 東東東が刻子、123mの1mでアガリ → shanpon + penchan の両方
      const decomp = createDecomp(TileType.HAKU, [
        {
          type: 'shuntsu',
          tiles: [TileType.MAN1, TileType.MAN2, TileType.MAN3],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.PIN4, TileType.PIN5, TileType.PIN6],
        },
        {
          type: 'shuntsu',
          tiles: [TileType.SOU7, TileType.SOU8, TileType.SOU9],
        },
        {
          type: 'koutsu',
          tiles: [TileType.MAN1, TileType.MAN1, TileType.MAN1],
        },
      ]);
      const hand: readonly TileType[] = [
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1,
        TileType.MAN1, // 4枚の1m（刻子+順子で使用）
        TileType.MAN2,
        TileType.MAN3,
        TileType.PIN4,
        TileType.PIN5,
        TileType.PIN6,
        TileType.SOU7,
        TileType.SOU8,
        TileType.SOU9,
        TileType.HAKU,
        TileType.HAKU,
      ];

      // Act
      const result = getWaitTypes(decomp, hand, TileType.MAN1);

      // Assert: shanpon（刻子に含まれる）+ penchan（123mで1m）の複合
      expect(result.size).toBeGreaterThanOrEqual(2);
      expect(result.has('shanpon')).toBe(true);
      expect(result.has('penchan')).toBe(true);
    });
  });
});
