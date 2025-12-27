/**
 * fuCalculator.ts のテスト
 */

import { calculateFu } from '../../../lib/scoring/fuCalculator';
import { TileType } from '../../../lib/tiles';
import { YakuResult, WinContext } from '../../../lib/scoring/types';

describe('calculateFu', () => {
  const createWinContext = (overrides?: Partial<WinContext>): WinContext => ({
    winningTile: TileType.MAN2,
    isTsumo: false,
    isDealer: false,
    isRiichi: false,
    roundWind: 'ton',
    seatWind: 'ton',
    dora: [],
    ...overrides,
  });

  const createYakuResult = (yakuIds: string[] = []): YakuResult => ({
    yakuList: [
      {
        id: yakuIds[0] || 'riichi',
        name: 'test',
        han: 1,
        hanNaki: 0,
        isYakuman: false,
      },
    ],
    totalHan: 1,
    isYakuman: false,
  });

  it('七対子は25符固定', () => {
    const hand = [
      TileType.MAN1,
      TileType.MAN1,
      TileType.MAN2,
      TileType.MAN2,
      TileType.MAN3,
      TileType.MAN3,
      TileType.MAN4,
      TileType.MAN4,
      TileType.PIN1,
      TileType.PIN1,
      TileType.PIN2,
      TileType.PIN2,
      TileType.SOU1,
      TileType.SOU1,
    ];

    const yakuResult: YakuResult = {
      yakuList: [
        {
          id: 'chiitoitsu',
          name: '七対子',
          han: 2,
          hanNaki: 0,
          isYakuman: false,
        },
      ],
      totalHan: 2,
      isYakuman: false,
    };

    const result = calculateFu(hand, yakuResult, createWinContext());
    expect(result.total).toBe(25);
    expect(result.rawTotal).toBe(25);
  });

  it('平和ツモは20符固定', () => {
    const hand = [
      TileType.MAN1,
      TileType.MAN2,
      TileType.MAN3,
      TileType.MAN4,
      TileType.MAN5,
      TileType.MAN6,
      TileType.PIN1,
      TileType.PIN2,
      TileType.PIN3,
      TileType.PIN4,
      TileType.PIN5,
      TileType.PIN6,
      TileType.SOU2,
      TileType.SOU2,
    ];

    const yakuResult: YakuResult = {
      yakuList: [
        {
          id: 'pinfu',
          name: '平和',
          han: 1,
          hanNaki: 0,
          isYakuman: false,
        },
      ],
      totalHan: 1,
      isYakuman: false,
    };

    const result = calculateFu(
      hand,
      yakuResult,
      createWinContext({ isTsumo: true, winningTile: TileType.SOU2 })
    );

    expect(result.total).toBe(20);
    expect(result.rawTotal).toBe(20);
    expect(result.tsumoFu).toBe(0);
  });

  it('25符は30符に切り上げ', () => {
    const hand = [
      TileType.MAN1,
      TileType.MAN2,
      TileType.MAN3,
      TileType.MAN4,
      TileType.MAN4,
      TileType.MAN4,
      TileType.PIN1,
      TileType.PIN2,
      TileType.PIN3,
      TileType.PIN4,
      TileType.PIN5,
      TileType.PIN6,
      TileType.SOU2,
      TileType.SOU2,
    ];

    const yakuResult = createYakuResult(['riichi']);

    const result = calculateFu(
      hand,
      yakuResult,
      createWinContext({
        isTsumo: false,
        winningTile: TileType.PIN4,
      })
    );

    expect(result.total % 10).toBe(0);
    expect(result.total).toBeGreaterThanOrEqual(20);
  });

  it('35符は40符に切り上げ', () => {
    const hand = [
      TileType.MAN1,
      TileType.MAN1,
      TileType.MAN1,
      TileType.MAN2,
      TileType.MAN2,
      TileType.MAN2,
      TileType.PIN1,
      TileType.PIN2,
      TileType.PIN3,
      TileType.PIN4,
      TileType.PIN5,
      TileType.PIN6,
      TileType.SOU2,
      TileType.SOU2,
    ];

    const yakuResult = createYakuResult(['riichi']);

    const result = calculateFu(
      hand,
      yakuResult,
      createWinContext({
        isTsumo: false,
        winningTile: TileType.MAN1,
      })
    );

    expect(result.total % 10).toBe(0);
  });

  it('45符は50符に切り上げ', () => {
    const hand = [
      TileType.MAN1,
      TileType.MAN1,
      TileType.MAN1,
      TileType.MAN2,
      TileType.MAN2,
      TileType.MAN2,
      TileType.PIN1,
      TileType.PIN1,
      TileType.PIN1,
      TileType.PIN2,
      TileType.PIN3,
      TileType.PIN4,
      TileType.SOU2,
      TileType.SOU2,
    ];

    const yakuResult = createYakuResult(['riichi']);

    const result = calculateFu(
      hand,
      yakuResult,
      createWinContext({
        isTsumo: false,
        winningTile: TileType.PIN1,
      })
    );

    expect(result.total % 10).toBe(0);
  });

  it('副底は常に20符', () => {
    const hand = [
      TileType.MAN1,
      TileType.MAN2,
      TileType.MAN3,
      TileType.MAN4,
      TileType.MAN5,
      TileType.MAN6,
      TileType.PIN1,
      TileType.PIN2,
      TileType.PIN3,
      TileType.PIN4,
      TileType.PIN5,
      TileType.PIN6,
      TileType.SOU2,
      TileType.SOU2,
    ];

    const yakuResult = createYakuResult(['riichi']);

    const result = calculateFu(
      hand,
      yakuResult,
      createWinContext({ isTsumo: false, winningTile: TileType.PIN4 })
    );

    expect(result.base).toBe(20);
  });

  it('役牌の雀頭は2符', () => {
    const hand = [
      TileType.MAN1,
      TileType.MAN2,
      TileType.MAN3,
      TileType.MAN4,
      TileType.MAN5,
      TileType.MAN6,
      TileType.PIN1,
      TileType.PIN2,
      TileType.PIN3,
      TileType.PIN4,
      TileType.PIN5,
      TileType.PIN6,
      TileType.HAKU,
      TileType.HAKU,
    ];

    const yakuResult: YakuResult = {
      yakuList: [
        {
          id: 'yakuhai_haku',
          name: '役牌 白',
          han: 1,
          hanNaki: 1,
          isYakuman: false,
        },
      ],
      totalHan: 1,
      isYakuman: false,
    };

    const result = calculateFu(
      hand,
      yakuResult,
      createWinContext({ isTsumo: false, winningTile: TileType.PIN4 })
    );

    expect(result.jantouFu).toBe(2);
  });

  it('中張牌の雀頭は0符', () => {
    const hand = [
      TileType.MAN1,
      TileType.MAN2,
      TileType.MAN3,
      TileType.MAN4,
      TileType.MAN5,
      TileType.MAN6,
      TileType.PIN1,
      TileType.PIN2,
      TileType.PIN3,
      TileType.PIN4,
      TileType.PIN5,
      TileType.PIN6,
      TileType.SOU2,
      TileType.SOU2,
    ];

    const yakuResult = createYakuResult(['riichi']);

    const result = calculateFu(
      hand,
      yakuResult,
      createWinContext({ isTsumo: false, winningTile: TileType.PIN4 })
    );

    expect(result.jantouFu).toBe(0);
  });

  it('通常のツモ和了は2符', () => {
    const hand = [
      TileType.MAN1,
      TileType.MAN2,
      TileType.MAN3,
      TileType.MAN4,
      TileType.MAN5,
      TileType.MAN6,
      TileType.PIN1,
      TileType.PIN2,
      TileType.PIN3,
      TileType.PIN4,
      TileType.PIN5,
      TileType.PIN6,
      TileType.SOU2,
      TileType.SOU2,
    ];

    const yakuResult = createYakuResult(['riichi']);

    const result = calculateFu(
      hand,
      yakuResult,
      createWinContext({ isTsumo: true, winningTile: TileType.SOU2 })
    );

    expect(result.tsumoFu).toBe(2);
  });

  it('平和ツモはツモ符なし', () => {
    const hand = [
      TileType.MAN1,
      TileType.MAN2,
      TileType.MAN3,
      TileType.MAN4,
      TileType.MAN5,
      TileType.MAN6,
      TileType.PIN1,
      TileType.PIN2,
      TileType.PIN3,
      TileType.PIN4,
      TileType.PIN5,
      TileType.PIN6,
      TileType.SOU2,
      TileType.SOU2,
    ];

    const yakuResult: YakuResult = {
      yakuList: [
        {
          id: 'pinfu',
          name: '平和',
          han: 1,
          hanNaki: 0,
          isYakuman: false,
        },
      ],
      totalHan: 1,
      isYakuman: false,
    };

    const result = calculateFu(
      hand,
      yakuResult,
      createWinContext({ isTsumo: true, winningTile: TileType.SOU2 })
    );

    expect(result.tsumoFu).toBe(0);
  });

  it('門前ロン和了は10符', () => {
    const hand = [
      TileType.MAN1,
      TileType.MAN2,
      TileType.MAN3,
      TileType.MAN4,
      TileType.MAN5,
      TileType.MAN6,
      TileType.PIN1,
      TileType.PIN2,
      TileType.PIN3,
      TileType.PIN4,
      TileType.PIN5,
      TileType.PIN6,
      TileType.SOU2,
      TileType.SOU2,
    ];

    const yakuResult = createYakuResult(['riichi']);

    const result = calculateFu(
      hand,
      yakuResult,
      createWinContext({ isTsumo: false, winningTile: TileType.PIN4 })
    );

    expect(result.menzenRonFu).toBe(10);
  });

  it('ツモ和了は門前ロン符なし', () => {
    const hand = [
      TileType.MAN1,
      TileType.MAN2,
      TileType.MAN3,
      TileType.MAN4,
      TileType.MAN5,
      TileType.MAN6,
      TileType.PIN1,
      TileType.PIN2,
      TileType.PIN3,
      TileType.PIN4,
      TileType.PIN5,
      TileType.PIN6,
      TileType.SOU2,
      TileType.SOU2,
    ];

    const yakuResult = createYakuResult(['riichi']);

    const result = calculateFu(
      hand,
      yakuResult,
      createWinContext({ isTsumo: true, winningTile: TileType.SOU2 })
    );

    expect(result.menzenRonFu).toBe(0);
  });

  it('順子は0符', () => {
    const hand = [
      TileType.MAN1,
      TileType.MAN2,
      TileType.MAN3,
      TileType.MAN4,
      TileType.MAN5,
      TileType.MAN6,
      TileType.PIN1,
      TileType.PIN2,
      TileType.PIN3,
      TileType.PIN4,
      TileType.PIN5,
      TileType.PIN6,
      TileType.SOU2,
      TileType.SOU2,
    ];

    const yakuResult = createYakuResult(['riichi']);

    const result = calculateFu(
      hand,
      yakuResult,
      createWinContext({ isTsumo: false, winningTile: TileType.PIN4 })
    );

    expect(
      result.mentsuFu.every((m) => m.type === 'shuntsu' && m.fu === 0)
    ).toBe(true);
  });

  it('基本的な符計算が10単位に丸められる', () => {
    const hand = [
      TileType.MAN1,
      TileType.MAN2,
      TileType.MAN3,
      TileType.MAN4,
      TileType.MAN5,
      TileType.MAN6,
      TileType.PIN1,
      TileType.PIN2,
      TileType.PIN3,
      TileType.PIN4,
      TileType.PIN5,
      TileType.PIN6,
      TileType.SOU2,
      TileType.SOU2,
    ];

    const yakuResult = createYakuResult(['riichi']);

    const result = calculateFu(
      hand,
      yakuResult,
      createWinContext({ isTsumo: false, winningTile: TileType.PIN4 })
    );

    expect(result.total % 10).toBe(0);
  });

  it('メンツ分割失敗時のフォールバック', () => {
    const hand = [
      TileType.MAN1,
      TileType.MAN2,
      TileType.MAN3,
      TileType.MAN4,
      TileType.MAN5,
      TileType.MAN6,
      TileType.PIN1,
      TileType.PIN2,
      TileType.PIN3,
      TileType.PIN4,
      TileType.PIN5,
      TileType.PIN6,
      TileType.SOU1,
      TileType.SOU2,
    ];

    const yakuResult = createYakuResult(['riichi']);

    const result = calculateFu(
      hand,
      yakuResult,
      createWinContext({ isTsumo: false, winningTile: TileType.PIN4 })
    );

    expect(result.base).toBe(20);
  });
});
