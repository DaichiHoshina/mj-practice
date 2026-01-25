/**
 * 麻雀の役判定ロジック
 * 手牌から役を判定し、翻数を計算
 */

import { TileType } from '../tiles';
import { YAKU_DEFINITIONS } from './constants';
import { calculateFu } from './fuCalculator';
import { calculateScore } from './scoreCalculator';
import { YakuResult, WinContext } from './types';
import {
  decomposeHand,
  getTileNumber,
  getTileSuit,
  getWaitTypes,
  normalizeTile,
  type DecomposedHand,
  type Mentsu,
} from './handDecomposer';

function isTerminalOrHonor(tile: TileType): boolean {
  const num = getTileNumber(tile);
  return num === 1 || num === 9 || getTileSuit(tile) === 'honor';
}

function isValuePair(tile: TileType, context: WinContext): boolean {
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

/** 役判定：リーチ */
function detectRiichi(context: WinContext): boolean {
  return context.isMenzen && context.isRiichi;
}

/** 役判定：タンヤオ */
function detectTanyao(hand: readonly TileType[]): boolean {
  return hand.every((tile) => {
    const normalized = normalizeTile(tile);
    const num = getTileNumber(normalized);
    return num !== null && num >= 2 && num <= 8;
  });
}

/** 役判定：平和 */
function detectPinfu(
  decomposition: DecomposedHand,
  hand: readonly TileType[],
  context: WinContext
): boolean {
  if (!context.isMenzen) return false;
  if (decomposition.mentsu.some((m) => m.type !== 'shuntsu')) return false;
  if (isValuePair(decomposition.jantou, context)) return false;

  const waitTypes = getWaitTypes(
    decomposition,
    hand,
    context.winningTile
  );
  return waitTypes.has('ryanmen');
}

/** 役判定：一盃口 */
function detectIipeikou(mentsu: readonly Mentsu[]): boolean {
  const shuntsu = mentsu.filter((m) => m.type === 'shuntsu');
  const seen = new Set<string>();

  for (const m of shuntsu) {
    const key = [...m.tiles].sort().join(',');
    if (seen.has(key)) return true;
    seen.add(key);
  }

  return false;
}

/** 役判定：役牌 */
function detectYakuhai(
  decomposition: DecomposedHand,
  context: WinContext
): { ids: string[]; bonusHan: number } {
  const ids: string[] = [];
  let bonusHan = 0;

  const windMap: Record<WinContext['roundWind'], TileType> = {
    ton: TileType.TON,
    nan: TileType.NAN,
    shaa: TileType.SHAA,
    pei: TileType.PEI,
  };

  const roundWindTile = windMap[context.roundWind];
  const seatWindTile = windMap[context.seatWind];

  const tripletTiles = new Set<TileType>();
  for (const m of decomposition.mentsu) {
    if (m.type === 'koutsu' || m.type === 'kantsu') {
      tripletTiles.add(normalizeTile(m.tiles[0]));
    }
  }

  if (tripletTiles.has(TileType.HAKU)) ids.push('yakuhai_haku');
  if (tripletTiles.has(TileType.HATSU)) ids.push('yakuhai_hatsu');
  if (tripletTiles.has(TileType.CHUN)) ids.push('yakuhai_chun');

  if (
    tripletTiles.has(TileType.TON) &&
    (roundWindTile === TileType.TON || seatWindTile === TileType.TON)
  ) {
    ids.push('yakuhai_ton');
  }
  if (
    tripletTiles.has(TileType.NAN) &&
    (roundWindTile === TileType.NAN || seatWindTile === TileType.NAN)
  ) {
    ids.push('yakuhai_nan');
  }
  if (
    tripletTiles.has(TileType.SHAA) &&
    (roundWindTile === TileType.SHAA || seatWindTile === TileType.SHAA)
  ) {
    ids.push('yakuhai_shaa');
  }
  if (
    tripletTiles.has(TileType.PEI) &&
    (roundWindTile === TileType.PEI || seatWindTile === TileType.PEI)
  ) {
    ids.push('yakuhai_pei');
  }

  if (roundWindTile === seatWindTile && tripletTiles.has(roundWindTile)) {
    bonusHan = 1;
  }

  return { ids, bonusHan };
}

/** 役判定：一気通貫 */
function detectIkkitsuukan(mentsu: readonly Mentsu[]): boolean {
  for (const suit of ['man', 'pin', 'sou'] as const) {
    const shuntsu = mentsu.filter(
      (m) =>
        m.type === 'shuntsu' && m.tiles.every((t) => getTileSuit(t) === suit)
    );

    const nums = new Set<number>();
    for (const m of shuntsu) {
      for (const t of m.tiles) {
        const num = getTileNumber(t);
        if (num !== null) nums.add(num);
      }
    }

    if (nums.size === 9) return true;
  }

  return false;
}

/** 役判定：三色同順 */
function detectSanshokuDoujun(mentsu: readonly Mentsu[]): boolean {
  const shuntsu = mentsu.filter((m) => m.type === 'shuntsu');

  const byNumber: Map<string, TileType[][]> = new Map();
  for (const m of shuntsu) {
    const firstNum = getTileNumber(m.tiles[0]);
    if (firstNum === null) continue;

    const key = `${firstNum}-${firstNum + 1}-${firstNum + 2}`;
    if (!byNumber.has(key)) byNumber.set(key, []);

    byNumber.get(key)!.push([...m.tiles]);
  }

  for (const group of byNumber.values()) {
    const suits = new Set<string>();
    for (const shun of group) {
      suits.add(getTileSuit(shun[0]));
    }
    if (suits.size === 3) return true;
  }

  return false;
}

/** 役判定：三色同刻 */
function detectSanshokuDoukou(mentsu: readonly Mentsu[]): boolean {
  const koutsu = mentsu.filter(
    (m) => m.type === 'koutsu' || m.type === 'kantsu'
  );
  const bySuit: Record<'man' | 'pin' | 'sou', Set<number>> = {
    man: new Set(),
    pin: new Set(),
    sou: new Set(),
  };

  for (const m of koutsu) {
    const suit = getTileSuit(m.tiles[0]);
    const num = getTileNumber(m.tiles[0]);
    if (suit !== 'honor' && num !== null) {
      bySuit[suit].add(num);
    }
  }

  for (let num = 1; num <= 9; num += 1) {
    if (bySuit.man.has(num) && bySuit.pin.has(num) && bySuit.sou.has(num)) {
      return true;
    }
  }

  return false;
}

/** 役判定：対々和 */
function detectToitoi(mentsu: readonly Mentsu[]): boolean {
  return mentsu.every((m) => m.type === 'koutsu' || m.type === 'kantsu');
}

function countConcealedTriplets(
  mentsu: readonly Mentsu[],
  winningTile: TileType,
  context: WinContext
): number {
  if (!context.isMenzen) return 0;
  const normalizedWinning = normalizeTile(winningTile);
  return mentsu.filter((m) => {
    if (m.type !== 'koutsu' && m.type !== 'kantsu') return false;
    if (context.isTsumo) return true;
    return !m.tiles.includes(normalizedWinning);
  }).length;
}

/** 役判定：三暗刻 */
function detectSanankou(
  mentsu: readonly Mentsu[],
  context: WinContext
): boolean {
  const concealedTriplets = countConcealedTriplets(
    mentsu,
    context.winningTile,
    context
  );
  return concealedTriplets >= 3;
}

/** 役判定：チャンタ */
function detectChanta(mentsu: readonly Mentsu[], jantou: TileType): boolean {
  if (!isTerminalOrHonor(jantou)) return false;
  let hasShuntsu = false;

  for (const m of mentsu) {
    if (m.type === 'shuntsu') hasShuntsu = true;
    const hasTerminal = m.tiles.some((t) => isTerminalOrHonor(t));
    if (!hasTerminal) return false;
  }

  return hasShuntsu;
}

/** 役判定：混一色 */
function detectHonitsu(hand: readonly TileType[]): boolean {
  let numberSuit: string | null = null;
  let hasHonor = false;

  for (const tile of hand) {
    const suit = getTileSuit(tile);
    if (suit === 'honor') {
      hasHonor = true;
    } else {
      if (numberSuit === null) numberSuit = suit;
      else if (numberSuit !== suit) return false;
    }
  }

  return hasHonor && numberSuit !== null;
}

/** 役判定：清一色 */
function detectChinitsu(hand: readonly TileType[]): boolean {
  let suit: string | null = null;

  for (const tile of hand) {
    const s = getTileSuit(tile);
    if (s === 'honor') return false;

    if (suit === null) suit = s;
    else if (suit !== s) return false;
  }

  return suit !== null;
}

/** 役判定：七対子 */
function detectChiitoitsu(hand: readonly TileType[]): boolean {
  if (hand.length !== 14) return false;

  const tileMap = new Map<TileType, number>();
  for (const tile of hand) {
    const normalized = normalizeTile(tile);
    tileMap.set(normalized, (tileMap.get(normalized) ?? 0) + 1);
  }

  if (tileMap.size !== 7) return false;

  for (const count of tileMap.values()) {
    if (count !== 2) return false;
  }

  return true;
}

/** 役判定：国士無双 */
function detectKokushimusou(hand: readonly TileType[]): boolean {
  if (hand.length !== 14) return false;

  const terminalAndHonor: TileType[] = [
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
  ];

  const normalized = hand.map(normalizeTile);
  const tileSet = new Set(normalized);

  if (tileSet.size !== 13) return false;

  for (const tile of terminalAndHonor) {
    if (!tileSet.has(tile)) return false;
  }

  return true;
}

/** 役判定：四暗刻 */
function detectSuuankou(
  mentsu: readonly Mentsu[],
  decomposition: DecomposedHand,
  hand: readonly TileType[],
  context: WinContext
): boolean {
  const concealedTriplets = countConcealedTriplets(
    mentsu,
    context.winningTile,
    context
  );
  if (concealedTriplets !== 4) return false;
  if (context.isTsumo) return true;

  const waitTypes = getWaitTypes(
    decomposition,
    hand,
    context.winningTile
  );
  return waitTypes.has('tanki');
}

/** 役判定：大三元 */
function detectDaisangen(mentsu: readonly Mentsu[]): boolean {
  const sangenTiles: TileType[] = [
    TileType.HAKU,
    TileType.HATSU,
    TileType.CHUN,
  ];
  const kotsuTiles = new Set<TileType>();

  for (const m of mentsu) {
    if (m.type === 'koutsu' || m.type === 'kantsu') {
      kotsuTiles.add(normalizeTile(m.tiles[0]));
    }
  }

  for (const tile of sangenTiles) {
    if (!kotsuTiles.has(tile)) return false;
  }

  return true;
}

/** 役判定：三槓子 */
function detectSankantsu(mentsu: readonly Mentsu[]): boolean {
  const kantsu = mentsu.filter((m) => m.type === 'kantsu');
  return kantsu.length >= 3;
}

/** 役判定：混老頭 */
function detectHonroutou(
  mentsu: readonly Mentsu[],
  jantou: TileType
): boolean {
  if (!isTerminalOrHonor(jantou)) return false;
  if (mentsu.some((m) => m.type === 'shuntsu')) return false;

  for (const m of mentsu) {
    if (!m.tiles.every((t) => isTerminalOrHonor(t))) return false;
  }

  return true;
}

/** 役判定：純全帯 */
function detectJunchan(mentsu: readonly Mentsu[], jantou: TileType): boolean {
  const jantouNum = getTileNumber(jantou);
  if (jantouNum === null || (jantouNum !== 1 && jantouNum !== 9)) return false;
  let hasShuntsu = false;

  for (const m of mentsu) {
    if (m.type === 'shuntsu') hasShuntsu = true;
    const hasTerminal = m.tiles.some((t) => {
      const num = getTileNumber(t);
      return num === 1 || num === 9;
    });
    if (!hasTerminal) return false;
    if (m.tiles.some((t) => getTileSuit(t) === 'honor')) return false;
  }

  return hasShuntsu;
}

/** 役判定：小三元 */
function detectShousangen(mentsu: readonly Mentsu[], jantou: TileType): boolean {
  const sangenTiles: TileType[] = [
    TileType.HAKU,
    TileType.HATSU,
    TileType.CHUN,
  ];
  const kotsuTiles = new Set<TileType>();
  let jantouIsSangen = false;

  for (const m of mentsu) {
    if (m.type === 'koutsu' || m.type === 'kantsu') {
      kotsuTiles.add(normalizeTile(m.tiles[0]));
    }
  }

  const jantouNormalized = normalizeTile(jantou);
  if (sangenTiles.includes(jantouNormalized)) {
    jantouIsSangen = true;
  }

  let sangenCount = kotsuTiles.size;
  if (jantouIsSangen) sangenCount += 1;

  return sangenCount === 3 && jantouIsSangen;
}

function buildYakuResult(
  yakuIds: Set<string>,
  context: WinContext,
  extraHan: number,
  decomposition: DecomposedHand | null
): YakuResult {
  const yakuList = YAKU_DEFINITIONS.filter((y) => yakuIds.has(y.id));
  let totalHan = 0;
  let isYakuman = false;

  for (const yaku of yakuList) {
    if (yaku.isYakuman) {
      isYakuman = true;
      totalHan = Math.max(totalHan, 13);
    } else {
      totalHan += context.isMenzen ? yaku.han : yaku.hanNaki;
    }
  }

  totalHan += extraHan;

  return {
    yakuList,
    totalHan: Math.min(totalHan, 13),
    isYakuman,
    decomposition,
  };
}

/**
 * 手牌から役を判定
 * @param hand 手牌（13or14枚）
 * @param context 和了コンテキスト
 * @returns 役判定結果
 */
export function detectYaku(
  hand: readonly TileType[],
  context: WinContext
): YakuResult {
  if (detectChiitoitsu(hand) && context.isMenzen) {
    const yakuIds = new Set<string>(['chiitoitsu']);
    return buildYakuResult(yakuIds, context, 0, null);
  }

  if (detectKokushimusou(hand) && context.isMenzen) {
    const yakuIds = new Set<string>(['kokushimusou']);
    const result = buildYakuResult(yakuIds, context, 0, null);
    return { ...result, isYakuman: true, totalHan: 13 };
  }

  const decompositions = decomposeHand(hand);
  const baseYakuIds = new Set<string>();
  if (detectRiichi(context)) baseYakuIds.add('riichi');
  if (detectTanyao(hand)) baseYakuIds.add('tanyao');
  if (detectHonitsu(hand)) baseYakuIds.add('honitsu');
  if (detectChinitsu(hand)) baseYakuIds.add('chinitsu');

  if (decompositions.length === 0) {
    return buildYakuResult(baseYakuIds, context, 0, null);
  }

  let bestResult: YakuResult | null = null;
  let bestFu = -1;
  let bestScore = -1;
  for (const decomposition of decompositions) {
    const yakuIds = new Set(baseYakuIds);
    let extraHan = 0;
    const { mentsu, jantou } = decomposition;

    if (detectPinfu(decomposition, hand, context)) yakuIds.add('pinfu');
    if (context.isMenzen && detectIipeikou(mentsu)) yakuIds.add('iipeikou');
    if (detectIkkitsuukan(mentsu)) yakuIds.add('ikkitsuukan');
    if (detectSanshokuDoujun(mentsu)) yakuIds.add('sanshoku_doujun');
    if (detectSanshokuDoukou(mentsu)) yakuIds.add('sanshoku_doukou');
    if (detectToitoi(mentsu)) yakuIds.add('toitoi');
    if (detectSanankou(mentsu, context)) yakuIds.add('sanankou');
    if (detectChanta(mentsu, jantou)) yakuIds.add('chanta');
    if (detectJunchan(mentsu, jantou)) yakuIds.add('junchan');
    if (detectSuuankou(mentsu, decomposition, hand, context))
      yakuIds.add('suuankou');
    if (detectDaisangen(mentsu)) yakuIds.add('daisangen');
    if (detectSankantsu(mentsu)) yakuIds.add('sankantsu');
    if (detectHonroutou(mentsu, jantou)) yakuIds.add('honroutou');
    if (detectShousangen(mentsu, jantou)) yakuIds.add('shousangen');

    const yakuhai = detectYakuhai(decomposition, context);
    yakuhai.ids.forEach((id) => yakuIds.add(id));
    extraHan = yakuhai.bonusHan;

    const result = buildYakuResult(yakuIds, context, extraHan, decomposition);
    const fuBreakdown = calculateFu(hand, result, context);
    const score = calculateScore(
      fuBreakdown.total,
      result.totalHan,
      context.isDealer,
      context.isTsumo
    ).score;

    if (
      !bestResult ||
      result.totalHan > bestResult.totalHan ||
      (result.totalHan === bestResult.totalHan &&
        (fuBreakdown.total > bestFu ||
          (fuBreakdown.total === bestFu && score > bestScore)))
    ) {
      bestResult = result;
      bestFu = fuBreakdown.total;
      bestScore = score;
    }
  }

  return (
    bestResult ?? buildYakuResult(baseYakuIds, context, 0, null)
  );
}
