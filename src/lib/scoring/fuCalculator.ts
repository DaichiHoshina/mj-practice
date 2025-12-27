/**
 * 麻雀の符計算ロジック
 * 手牌から符を計算し、切り上げを適用
 */

import { TileType } from '../tiles';
import { FuBreakdown, MentsuFuItem, YakuResult, WinContext } from './types';
import { FU_TABLE } from './constants';

/** メンツの型（内部使用） */
type Mentsu = {
  readonly type: 'shuntsu' | 'koutsu' | 'kantsu';
  readonly tiles: readonly TileType[];
};

/** 牌の正規化（赤ドラを通常牌に） */
function normalizeTile(tile: TileType): TileType {
  if (tile === TileType.MAN5_DORA) return TileType.MAN5;
  if (tile === TileType.PIN5_DORA) return TileType.PIN5;
  if (tile === TileType.SOU5_DORA) return TileType.SOU5;
  return tile;
}

/** 牌の種類を取得（m/p/s/honor） */
function getTileSuit(tile: TileType): 'man' | 'pin' | 'sou' | 'honor' {
  const str = tile as string;
  if (str.endsWith('m') || str === '0m') return 'man';
  if (str.endsWith('p') || str === '0p') return 'pin';
  if (str.endsWith('s') || str === '0s') return 'sou';
  return 'honor';
}

/** 牌の数値を取得 */
function getTileNumber(tile: TileType): number | null {
  const str = tile as string;
  if (str.endsWith('m') || str.endsWith('p') || str.endsWith('s')) {
    const num = str.slice(0, -1);
    return num === '0' ? 5 : parseInt(num, 10);
  }
  return null;
}

/** 手牌をメンツに分割 */
function splitMentsu(hand: readonly TileType[], winningTile: TileType): Mentsu[] | null {
  const normalized = hand.map(normalizeTile);
  const tiles = [...normalized];

  // 雀頭を探す
  let jantouIdx = -1;
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] === tiles[i + 1]) {
      jantouIdx = i;
      break;
    }
  }

  if (jantouIdx === -1) return null;

  // 雀頭を削除
  const remaining = [
    ...tiles.slice(0, jantouIdx),
    ...tiles.slice(jantouIdx + 2),
  ];

  // メンツに分割（貪欲法）
  const mentsu: Mentsu[] = [];
  let idx = 0;

  while (idx < remaining.length) {
    const tile = remaining[idx];
    const suit = getTileSuit(tile);
    const num = getTileNumber(tile);

    // 刻子チェック
    if (
      idx + 2 < remaining.length &&
      remaining[idx + 1] === tile &&
      remaining[idx + 2] === tile
    ) {
      mentsu.push({ type: 'koutsu', tiles: [tile, tile, tile] });
      remaining.splice(idx, 3);
      idx = 0;
      continue;
    }

    // 順子チェック（数牌のみ）
    if (suit !== 'honor' && num !== null && num < 8) {
      let found = false;
      for (let i = idx + 1; i < remaining.length; i++) {
        if (
          getTileSuit(remaining[i]) === suit &&
          getTileNumber(remaining[i]) === num + 1
        ) {
          for (let j = i + 1; j < remaining.length; j++) {
            if (
              getTileSuit(remaining[j]) === suit &&
              getTileNumber(remaining[j]) === num + 2
            ) {
              mentsu.push({
                type: 'shuntsu',
                tiles: [tile, remaining[i], remaining[j]],
              });
              remaining.splice(j, 1);
              remaining.splice(i, 1);
              remaining.splice(idx, 1);
              idx = 0;
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }
      if (found) continue;
    }

    idx++;
  }

  // すべてメンツに分割できたか
  return remaining.length === 0 ? mentsu : null;
}

/** 牌が役牌かチェック */
function isYakuhaiTile(tile: TileType): boolean {
  const normalized = normalizeTile(tile);
  return [
    TileType.TON,
    TileType.NAN,
    TileType.SHAA,
    TileType.PEI,
    TileType.HAKU,
    TileType.HATSU,
    TileType.CHUN,
  ].includes(normalized);
}

/** 牌が么九牌かチェック */
function isYaochuuhaiTile(tile: TileType): boolean {
  const num = getTileNumber(tile);
  return num === 1 || num === 9 || getTileSuit(tile) === 'honor';
}

/** 雀頭を特定 */
function findJantou(hand: readonly TileType[]): TileType | null {
  const handMap = new Map<TileType, number>();
  for (const tile of hand) {
    const normalized = normalizeTile(tile);
    handMap.set(normalized, (handMap.get(normalized) ?? 0) + 1);
  }

  for (const [tile, count] of handMap) {
    if (count >= 2) {
      return tile;
    }
  }

  return null;
}

type MachiType = 'normal' | 'penchan' | 'kanchan' | 'tanki';

/** 待ちのタイプを判定 */
function determineMachiType(
  hand: readonly TileType[],
  mentsu: Mentsu[],
  jantou: TileType,
  winningTile: TileType,
): MachiType {
  const normalized = hand.map(normalizeTile);

  // 単騎待ちチェック
  if (normalized.filter((t) => normalizeTile(t) === jantou).length === 2) {
    return 'tanki';
  }

  // メンツに含まれる待ちから待ち形を判定
  const winningNum = getTileNumber(winningTile);
  const winningSuit = getTileSuit(winningTile);

  for (const m of mentsu) {
    if (m.type === 'shuntsu') {
      const nums = m.tiles
        .map((t) => getTileNumber(t))
        .filter((n) => n !== null) as number[];
      const suits = m.tiles.map((t) => getTileSuit(t));

      // すべて同じ種類のメンツかチェック
      if (suits.every((s) => s === winningSuit)) {
        if (winningNum === null) continue;

        // 辺張（1-2-3で3を待つ、or 7-8-9で7を待つ）
        if (
          (nums.includes(1) && nums.includes(2) && winningNum === 3) ||
          (nums.includes(7) && nums.includes(8) && winningNum === 9)
        ) {
          return 'penchan';
        }

        // 嵌張（1-3で2を待つ, 2-4で3を待つ等）
        if (
          (nums.includes(1) && nums.includes(3) && winningNum === 2) ||
          (nums.includes(2) && nums.includes(4) && winningNum === 3) ||
          (nums.includes(3) && nums.includes(5) && winningNum === 4) ||
          (nums.includes(4) && nums.includes(6) && winningNum === 5) ||
          (nums.includes(5) && nums.includes(7) && winningNum === 6) ||
          (nums.includes(6) && nums.includes(8) && winningNum === 7) ||
          (nums.includes(7) && nums.includes(9) && winningNum === 8)
        ) {
          return 'kanchan';
        }
      }
    }
  }

  return 'normal';
}

/** 面子符を計算 */
function calculateMentsuFu(
  mentsu: Mentsu[],
  winningTile: TileType,
  isTsumo: boolean,
): MentsuFuItem[] {
  const result: MentsuFuItem[] = [];

  for (const m of mentsu) {
    if (m.type === 'shuntsu') {
      // 順子は0符
      result.push({
        type: 'shuntsu',
        tiles: m.tiles as readonly TileType[],
        isAnkou: false,
        isYaochuuhai: false,
        fu: FU_TABLE.MENTSU.SHUNTSU,
      });
    } else if (m.type === 'koutsu') {
      // 刻子の符を計算
      const tile = normalizeTile(m.tiles[0]);
      const isAnkou =
        !m.tiles.includes(winningTile) &&
        m.tiles.every((t) => normalizeTile(t) === tile);
      const isYaochuuhai = isYaochuuhaiTile(tile);

      let fu: number;
      if (isYaochuuhai) {
        fu = isAnkou
          ? FU_TABLE.MENTSU.YAOCHUU_ANKOU
          : FU_TABLE.MENTSU.YAOCHUU_MINKOU;
      } else {
        fu = isAnkou
          ? FU_TABLE.MENTSU.CHUNCHAN_ANKOU
          : FU_TABLE.MENTSU.CHUNCHAN_MINKOU;
      }

      result.push({
        type: 'koutsu',
        tiles: m.tiles as readonly TileType[],
        isAnkou,
        isYaochuuhai,
        fu,
      });
    } else if (m.type === 'kantsu') {
      // 槓子の符を計算
      const tile = normalizeTile(m.tiles[0]);
      const isAnkan = !m.tiles.includes(winningTile);
      const isYaochuuhai = isYaochuuhaiTile(tile);

      let fu: number;
      if (isYaochuuhai) {
        fu = isAnkan
          ? FU_TABLE.MENTSU.YAOCHUU_ANKAN
          : FU_TABLE.MENTSU.YAOCHUU_MINKAN;
      } else {
        fu = isAnkan
          ? FU_TABLE.MENTSU.CHUNCHAN_ANKAN
          : FU_TABLE.MENTSU.CHUNCHAN_MINKAN;
      }

      result.push({
        type: 'kantsu',
        tiles: m.tiles as readonly TileType[],
        isAnkou: isAnkan,
        isYaochuuhai,
        fu,
      });
    }
  }

  return result;
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
  context: WinContext,
): FuBreakdown {
  // 七対子は25符固定
  if (
    yakuResult.yakuList.some(
      (yaku) => yaku.id === 'chiitoitsu',
    )
  ) {
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

  const mentsu = splitMentsu(hand, context.winningTile);
  if (!mentsu) {
    // メンツ分割失敗時のフォールバック
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

  const jantou = findJantou(hand);
  if (!jantou) {
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

  // 面子符を計算
  const mentsuFu = calculateMentsuFu(mentsu, context.winningTile, context.isTsumo);
  const mentsuFuTotal = mentsuFu.reduce((sum, item) => sum + item.fu, 0);

  // 雀頭符（役牌の場合のみ）
  const jantouFu = isYakuhaiTile(jantou) ? FU_TABLE.JANTOU : 0;

  // 待ち符
  let machiFu = 0;
  if (!context.isTsumo) {
    const machiType = determineMachiType(hand, mentsu, jantou, context.winningTile);
    if (machiType === 'penchan' || machiType === 'kanchan' || machiType === 'tanki') {
      machiFu = FU_TABLE.MACHI;
    }
  }

  // ツモ符（平和ツモの場合は0）
  let tsumoFu = 0;
  if (context.isTsumo) {
    const isPinfu = yakuResult.yakuList.some((yaku) => yaku.id === 'pinfu');
    if (!isPinfu) {
      tsumoFu = FU_TABLE.TSUMO;
    }
  }

  // 門前ロン符（ツモの場合は0）
  let menzenRonFu = 0;
  if (!context.isTsumo) {
    menzenRonFu = FU_TABLE.MENZEN_RON;
  }

  // 切り上げ前合計
  let rawTotal =
    FU_TABLE.BASE + mentsuFuTotal + jantouFu + machiFu + tsumoFu + menzenRonFu;

  // 平和ツモは20符固定
  if (context.isTsumo && yakuResult.yakuList.some((yaku) => yaku.id === 'pinfu')) {
    rawTotal = 20;
  }

  // 10符単位に切り上げ
  const total = Math.ceil(rawTotal / FU_TABLE.ROUND_UP_UNIT) * FU_TABLE.ROUND_UP_UNIT;

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
