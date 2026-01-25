/**
 * 麻雀の符計算ロジック
 * 手牌から符を計算し、切り上げを適用
 */

import { TileType } from '../tiles';
import { FuBreakdown, MentsuFuItem, YakuResult, WinContext } from './types';
import { FU_TABLE } from './constants';
import {
  decomposeHand,
  getTileNumber,
  getTileSuit,
  getWaitTypes,
  normalizeTile,
  type DecomposedHand,
  type Mentsu,
} from './handDecomposer';

function isYakuhaiTile(tile: TileType, context: WinContext): boolean {
  const normalized = normalizeTile(tile);
  const windMap: Record<WinContext['roundWind'], TileType> = {
    ton: TileType.TON,
    nan: TileType.NAN,
    shaa: TileType.SHAA,
    pei: TileType.PEI,
  };
  const roundWindTile = windMap[context.roundWind];
  const seatWindTile = windMap[context.seatWind];

  return (
    normalized === TileType.HAKU ||
    normalized === TileType.HATSU ||
    normalized === TileType.CHUN ||
    normalized === roundWindTile ||
    normalized === seatWindTile
  );
}

function isYaochuuhaiTile(tile: TileType): boolean {
  const num = getTileNumber(tile);
  return num === 1 || num === 9 || getTileSuit(tile) === 'honor';
}

function calculateMentsuFu(
  mentsu: readonly Mentsu[],
  winningTile: TileType,
  context: WinContext
): MentsuFuItem[] {
  const result: MentsuFuItem[] = [];
  const normalizedWinning = normalizeTile(winningTile);

  for (const m of mentsu) {
    if (m.type === 'shuntsu') {
      result.push({
        type: 'shuntsu',
        tiles: m.tiles as readonly TileType[],
        isAnkou: false,
        isYaochuuhai: false,
        fu: FU_TABLE.MENTSU.SHUNTSU,
      });
      continue;
    }

    const tile = normalizeTile(m.tiles[0]);
    const isYaochuuhai = isYaochuuhaiTile(tile);
    const containsWinning = m.tiles.includes(normalizedWinning);
    const isConcealed =
      context.isMenzen && (context.isTsumo || !containsWinning);

    if (m.type === 'koutsu') {
      const fu = isYaochuuhai
        ? isConcealed
          ? FU_TABLE.MENTSU.YAOCHUU_ANKOU
          : FU_TABLE.MENTSU.YAOCHUU_MINKOU
        : isConcealed
          ? FU_TABLE.MENTSU.CHUNCHAN_ANKOU
          : FU_TABLE.MENTSU.CHUNCHAN_MINKOU;

      result.push({
        type: 'koutsu',
        tiles: m.tiles as readonly TileType[],
        isAnkou: isConcealed,
        isYaochuuhai,
        fu,
      });
    } else if (m.type === 'kantsu') {
      const fu = isYaochuuhai
        ? isConcealed
          ? FU_TABLE.MENTSU.YAOCHUU_ANKAN
          : FU_TABLE.MENTSU.YAOCHUU_MINKAN
        : isConcealed
          ? FU_TABLE.MENTSU.CHUNCHAN_ANKAN
          : FU_TABLE.MENTSU.CHUNCHAN_MINKAN;

      result.push({
        type: 'kantsu',
        tiles: m.tiles as readonly TileType[],
        isAnkou: isConcealed,
        isYaochuuhai,
        fu,
      });
    }
  }

  return result;
}

function calculateFuForDecomposition(
  hand: readonly TileType[],
  decomposition: DecomposedHand,
  yakuResult: YakuResult,
  context: WinContext
): FuBreakdown {
  const mentsuFu = calculateMentsuFu(
    decomposition.mentsu,
    context.winningTile,
    context
  );
  const mentsuFuTotal = mentsuFu.reduce((sum, item) => sum + item.fu, 0);

  const jantouFu = isYakuhaiTile(decomposition.jantou, context)
    ? FU_TABLE.JANTOU
    : 0;

  let machiFu = 0;
  const waitTypes = getWaitTypes(
    decomposition,
    hand,
    context.winningTile
  );
  if (
    waitTypes.has('tanki') ||
    waitTypes.has('penchan') ||
    waitTypes.has('kanchan')
  ) {
    machiFu = FU_TABLE.MACHI;
  }

  let tsumoFu = 0;
  if (context.isTsumo) {
    const isPinfu = yakuResult.yakuList.some((yaku) => yaku.id === 'pinfu');
    if (!isPinfu) {
      tsumoFu = FU_TABLE.TSUMO;
    }
  }

  let menzenRonFu = 0;
  if (!context.isTsumo && context.isMenzen) {
    menzenRonFu = FU_TABLE.MENZEN_RON;
  }

  let rawTotal =
    FU_TABLE.BASE + mentsuFuTotal + jantouFu + machiFu + tsumoFu + menzenRonFu;

  if (
    context.isTsumo &&
    yakuResult.yakuList.some((yaku) => yaku.id === 'pinfu')
  ) {
    rawTotal = 20;
  }

  const total =
    Math.ceil(rawTotal / FU_TABLE.ROUND_UP_UNIT) * FU_TABLE.ROUND_UP_UNIT;

  return {
    base: FU_TABLE.BASE,
    mentsuFu,
    jantouFu,
    machiFu,
    tsumoFu,
    menzenRonFu,
    rawTotal,
    total,
  };
}

/**
 * 符を計算
 * @param hand 手牌（13or14枚）
 * @param yakuResult 役判定結果
 * @param context 和了コンテキスト
 * @returns 符の内訳
 */
export function calculateFu(
  hand: readonly TileType[],
  yakuResult: YakuResult,
  context: WinContext
): FuBreakdown {
  if (yakuResult.yakuList.some((yaku) => yaku.id === 'chiitoitsu')) {
    return {
      base: FU_TABLE.BASE,
      mentsuFu: [],
      jantouFu: 0,
      machiFu: 0,
      tsumoFu: 0,
      menzenRonFu: 0,
      rawTotal: 25,
      total: 25,
    };
  }

  if (yakuResult.decomposition) {
    return calculateFuForDecomposition(
      hand,
      yakuResult.decomposition,
      yakuResult,
      context
    );
  }

  const decompositions = decomposeHand(hand);
  if (decompositions.length === 0) {
    return {
      base: FU_TABLE.BASE,
      mentsuFu: [],
      jantouFu: 0,
      machiFu: 0,
      tsumoFu: 0,
      menzenRonFu: 0,
      rawTotal: FU_TABLE.BASE,
      total: FU_TABLE.BASE,
    };
  }

  let best: FuBreakdown | null = null;
  for (const decomposition of decompositions) {
    const breakdown = calculateFuForDecomposition(
      hand,
      decomposition,
      yakuResult,
      context
    );
    if (!best || breakdown.total > best.total) {
      best = breakdown;
    }
  }

  return best ?? {
    base: FU_TABLE.BASE,
    mentsuFu: [],
    jantouFu: 0,
    machiFu: 0,
    tsumoFu: 0,
    menzenRonFu: 0,
    rawTotal: FU_TABLE.BASE,
    total: FU_TABLE.BASE,
  };
}
