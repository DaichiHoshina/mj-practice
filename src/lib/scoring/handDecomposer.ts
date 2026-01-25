import { TileType, NUMBER_TILES, HONOR_TILES } from '../tiles';

export type TileSuit = 'man' | 'pin' | 'sou' | 'honor';

export type Mentsu = {
  readonly type: 'shuntsu' | 'koutsu' | 'kantsu';
  readonly tiles: readonly TileType[];
};

export type DecomposedHand = {
  readonly jantou: TileType;
  readonly mentsu: readonly Mentsu[];
};

export type WaitType = 'ryanmen' | 'penchan' | 'kanchan' | 'tanki' | 'shanpon';

const TILE_ORDER: readonly TileType[] = [...NUMBER_TILES, ...HONOR_TILES];
const TILE_INDEX = new Map<TileType, number>(
  TILE_ORDER.map((tile, index) => [tile, index])
);

/** 牌の正規化（赤ドラを通常牌に） */
export function normalizeTile(tile: TileType): TileType {
  if (tile === TileType.MAN5_DORA) return TileType.MAN5;
  if (tile === TileType.PIN5_DORA) return TileType.PIN5;
  if (tile === TileType.SOU5_DORA) return TileType.SOU5;
  return tile;
}

/** 牌の種類を取得（m/p/s/honor） */
export function getTileSuit(tile: TileType): TileSuit {
  const str = tile as string;
  if (str.endsWith('m') || str === '0m') return 'man';
  if (str.endsWith('p') || str === '0p') return 'pin';
  if (str.endsWith('s') || str === '0s') return 'sou';
  return 'honor';
}

/** 牌の数値を取得 */
export function getTileNumber(tile: TileType): number | null {
  const str = tile as string;
  if (str.endsWith('m') || str.endsWith('p') || str.endsWith('s')) {
    const num = str.slice(0, -1);
    return num === '0' ? 5 : parseInt(num, 10);
  }
  return null;
}

function tileFromSuitNumber(suit: 'man' | 'pin' | 'sou', num: number): TileType {
  const suffix = suit === 'man' ? 'm' : suit === 'pin' ? 'p' : 's';
  return `${num}${suffix}` as TileType;
}

function buildCounts(hand: readonly TileType[]): number[] {
  const counts = new Array<number>(TILE_ORDER.length).fill(0);
  for (const tile of hand) {
    const normalized = normalizeTile(tile);
    const index = TILE_INDEX.get(normalized);
    if (index !== undefined) {
      counts[index] += 1;
    }
  }
  return counts;
}

function findMentsuSets(counts: number[]): Mentsu[][] {
  let firstIndex = -1;
  for (let i = 0; i < counts.length; i += 1) {
    if (counts[i] > 0) {
      firstIndex = i;
      break;
    }
  }

  if (firstIndex === -1) return [[]];

  const tile = TILE_ORDER[firstIndex];
  const results: Mentsu[][] = [];

  // 刻子
  if (counts[firstIndex] >= 3) {
    counts[firstIndex] -= 3;
    const next = findMentsuSets(counts);
    for (const set of next) {
      results.push([
        { type: 'koutsu', tiles: [tile, tile, tile] },
        ...set,
      ]);
    }
    counts[firstIndex] += 3;
  }

  // 槓子（4枚）
  if (counts[firstIndex] >= 4) {
    counts[firstIndex] -= 4;
    const next = findMentsuSets(counts);
    for (const set of next) {
      results.push([
        { type: 'kantsu', tiles: [tile, tile, tile, tile] },
        ...set,
      ]);
    }
    counts[firstIndex] += 4;
  }

  // 順子（数牌のみ）
  const suit = getTileSuit(tile);
  const num = getTileNumber(tile);
  if (suit !== 'honor' && num !== null && num <= 7) {
    const tile2 = tileFromSuitNumber(suit, num + 1);
    const tile3 = tileFromSuitNumber(suit, num + 2);
    const index2 = TILE_INDEX.get(tile2);
    const index3 = TILE_INDEX.get(tile3);
    if (
      index2 !== undefined &&
      index3 !== undefined &&
      counts[index2] > 0 &&
      counts[index3] > 0
    ) {
      counts[firstIndex] -= 1;
      counts[index2] -= 1;
      counts[index3] -= 1;
      const next = findMentsuSets(counts);
      for (const set of next) {
        results.push([
          { type: 'shuntsu', tiles: [tile, tile2, tile3] },
          ...set,
        ]);
      }
      counts[firstIndex] += 1;
      counts[index2] += 1;
      counts[index3] += 1;
    }
  }

  return results;
}

/**
 * 手牌をメンツ+雀頭に分解（全候補）
 */
export function decomposeHand(hand: readonly TileType[]): DecomposedHand[] {
  const normalizedHand = hand.map(normalizeTile);
  const counts = buildCounts(normalizedHand);
  const results: DecomposedHand[] = [];

  for (let i = 0; i < counts.length; i += 1) {
    if (counts[i] < 2) continue;
    const jantouTile = TILE_ORDER[i];
    counts[i] -= 2;
    const mentsuSets = findMentsuSets(counts);
    for (const mentsu of mentsuSets) {
      if (mentsu.length === 4) {
        results.push({ jantou: jantouTile, mentsu });
      }
    }
    counts[i] += 2;
  }

  return results;
}

function getWaitTypeForShuntsu(
  shuntsu: readonly TileType[],
  winningTile: TileType
): WaitType {
  const nums = shuntsu
    .map((tile) => getTileNumber(tile))
    .filter((num): num is number => num !== null)
    .sort((a, b) => a - b);
  const winningNum = getTileNumber(winningTile);
  if (winningNum === null || nums.length !== 3) return 'ryanmen';

  const middle = nums[1];
  if (winningNum === middle) return 'kanchan';

  const first = nums[0];
  if (first === 1 && (winningNum === 1 || winningNum === 3)) return 'penchan';
  if (first === 7 && (winningNum === 7 || winningNum === 9)) return 'penchan';

  return 'ryanmen';
}

/**
 * 待ち形の候補を取得
 */
export function getWaitTypes(
  decomposition: DecomposedHand,
  hand: readonly TileType[],
  winningTile: TileType
): Set<WaitType> {
  const types = new Set<WaitType>();
  const normalizedWinning = normalizeTile(winningTile);
  const normalizedHand = hand.map(normalizeTile);
  const winningCount = normalizedHand.filter(
    (tile) => tile === normalizedWinning
  ).length;

  if (decomposition.jantou === normalizedWinning && winningCount === 2) {
    types.add('tanki');
  }

  for (const m of decomposition.mentsu) {
    if (m.type === 'shuntsu') {
      if (m.tiles.includes(normalizedWinning)) {
        types.add(getWaitTypeForShuntsu(m.tiles, normalizedWinning));
      }
    } else if (m.type === 'koutsu' || m.type === 'kantsu') {
      if (m.tiles.includes(normalizedWinning)) {
        types.add('shanpon');
      }
    }
  }

  return types;
}
