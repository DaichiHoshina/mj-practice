/**
 * 麻雀の役判定ロジック
 * 手牌から役を判定し、翻数を計算
 */

import { TileType, NUMBER_TILES, HONOR_TILES } from '../tiles';
import { YAKU_DEFINITIONS } from './constants';
import { Yaku, YakuResult, WinContext } from './types';

/** メンツの型 */
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
function splitMentsu(
  hand: readonly TileType[],
  winningTile: TileType,
): Mentsu[] | null {
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

/** 役判定：リーチ */
function detectRiichi(context: WinContext): boolean {
  return context.isRiichi;
}

/** 役判定：タンヤオ */
function detectTanyao(hand: readonly TileType[]): boolean {
  return hand.every((tile) => {
    const num = getTileNumber(tile);
    return num === null || (num >= 2 && num <= 8);
  });
}

/** 役判定：平和 */
function detectPinfu(
  mentsu: Mentsu[],
  hand: readonly TileType[],
  jantou: TileType,
): boolean {
  // 全て順子か確認
  const isAllShuntsu = mentsu.every((m) => m.type === 'shuntsu');
  if (!isAllShuntsu) return false;

  // 雀頭が中張牌か確認
  const jantouNum = getTileNumber(jantou);
  if (jantouNum === null || jantouNum < 2 || jantouNum > 8) return false;

  return true;
}

/** 役判定：一盃口 */
function detectIipekou(mentsu: Mentsu[]): boolean {
  const shuntsu = mentsu.filter((m) => m.type === 'shuntsu');
  const seen = new Set<string>();

  for (const m of shuntsu) {
    const key = m.tiles.map(normalizeTile).sort().join(',');
    if (seen.has(key)) return true;
    seen.add(key);
  }

  return false;
}

/** 役判定：役牌 */
function detectYakuhai(hand: readonly TileType[]): string[] {
  const yakuList: string[] = [];
  const yakuhaiTiles: { tile: TileType; id: string }[] = [
    { tile: TileType.HAKU, id: 'yakuhai_haku' },
    { tile: TileType.HATSU, id: 'yakuhai_hatsu' },
    { tile: TileType.CHUN, id: 'yakuhai_chun' },
  ];

  for (const { tile, id } of yakuhaiTiles) {
    if (hand.filter((t) => normalizeTile(t) === tile).length >= 3) {
      yakuList.push(id);
    }
  }

  return yakuList;
}

/** 役判定：一気通貫 */
function detectIkkitsuukan(mentsu: Mentsu[]): boolean {
  for (const suit of ['man', 'pin', 'sou'] as const) {
    const shuntsu = mentsu.filter(
      (m) =>
        m.type === 'shuntsu' &&
        m.tiles.every((t) => getTileSuit(t) === suit),
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
function detectSanshokuDoujun(mentsu: Mentsu[]): boolean {
  const shuntsu = mentsu.filter((m) => m.type === 'shuntsu');

  // 3色の順子をグループ化
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

/** 役判定：対々和 */
function detectToitoi(mentsu: Mentsu[]): boolean {
  return mentsu.every((m) => m.type === 'koutsu' || m.type === 'kantsu');
}

/** 役判定：三暗刻 */
function detectSanankou(
  mentsu: Mentsu[],
  winningTile: TileType,
  isTsumo: boolean,
): boolean {
  if (!isTsumo) return false;

  const ankou = mentsu.filter(
    (m) =>
      (m.type === 'koutsu' || m.type === 'kantsu') &&
      !m.tiles.includes(winningTile),
  );

  return ankou.length >= 3;
}

/** 役判定：チャンタ */
function detectChanta(mentsu: Mentsu[], jantou: TileType): boolean {
  // 雀頭に1or9
  const jantouNum = getTileNumber(jantou);
  if (jantouNum !== null && jantouNum !== 1 && jantouNum !== 9) return false;
  if (getTileSuit(jantou) !== 'honor' && jantouNum === null) return false;

  // 全メンツに1or9
  for (const m of mentsu) {
    const hasTerminal = m.tiles.some((t) => {
      const num = getTileNumber(t);
      return (
        getTileSuit(t) === 'honor' || (num !== null && (num === 1 || num === 9))
      );
    });
    if (!hasTerminal) return false;
  }

  return true;
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
  mentsu: Mentsu[],
  winningTile: TileType,
  isTsumo: boolean,
): boolean {
  if (!isTsumo) return false;

  const ankou = mentsu.filter(
    (m) =>
      (m.type === 'koutsu' || m.type === 'kantsu') &&
      !m.tiles.includes(winningTile),
  );

  return ankou.length === 4;
}

/** 役判定：大三元 */
function detectDaisangen(mentsu: Mentsu[]): boolean {
  const sangenTiles: TileType[] = [TileType.HAKU, TileType.HATSU, TileType.CHUN];
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
function detectSankantsu(mentsu: Mentsu[]): boolean {
  const kantsu = mentsu.filter((m) => m.type === 'kantsu');
  return kantsu.length === 3;
}

/** 役判定：混老頭 */
function detectHonroutou(hand: readonly TileType[], jantou: TileType): boolean {
  const validTiles = [
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

  const jantouNum = getTileNumber(jantou);
  if (jantouNum !== null && jantouNum !== 1 && jantouNum !== 9) return false;

  for (const tile of hand) {
    if (!validTiles.includes(normalizeTile(tile))) return false;
  }

  return true;
}

/** 役判定：純全帯 */
function detectJunchan(mentsu: Mentsu[], jantou: TileType): boolean {
  // 雀頭に1or9
  const jantouNum = getTileNumber(jantou);
  if (jantouNum === null || (jantouNum !== 1 && jantouNum !== 9)) return false;

  // 全メンツに1or9
  for (const m of mentsu) {
    const hasTerminal = m.tiles.some((t) => {
      const num = getTileNumber(t);
      return num === 1 || num === 9;
    });
    if (!hasTerminal) return false;
  }

  return true;
}

/** 役判定：小三元 */
function detectShousangen(
  mentsu: Mentsu[],
  jantou: TileType,
): boolean {
  const sangenTiles: TileType[] = [TileType.HAKU, TileType.HATSU, TileType.CHUN];
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
  if (jantouIsSangen) sangenCount++;

  return sangenCount === 3 && jantouIsSangen;
}

/**
 * 手牌から役を判定
 * @param hand 手牌（13or14枚）
 * @param context 和了コンテキスト
 * @returns 役判定結果
 */
export function detectYaku(
  hand: readonly TileType[],
  context: WinContext,
): YakuResult {
  const yakuIds = new Set<string>();

  // 七対子の判定（メンツ分割不要）
  if (detectChiitoitsu(hand)) {
    yakuIds.add('chiitoitsu');
    const yakuList = YAKU_DEFINITIONS.filter((y) => yakuIds.has(y.id));
    return {
      yakuList,
      totalHan: 2,
      isYakuman: false,
    };
  }

  // 国士無双の判定（メンツ分割不要）
  if (detectKokushimusou(hand)) {
    yakuIds.add('kokushimusou');
    const yakuList = YAKU_DEFINITIONS.filter((y) => yakuIds.has(y.id));
    return {
      yakuList,
      totalHan: 13,
      isYakuman: true,
    };
  }

  // 通常形の判定
  const mentsu = splitMentsu(hand, context.winningTile);
  if (!mentsu) {
    // メンツ分割失敗時も基本的な役判定を試みる
    if (detectRiichi(context)) yakuIds.add('riichi');
    if (detectTanyao(hand)) yakuIds.add('tanyao');
    if (detectHonitsu(hand)) yakuIds.add('honitsu');
    if (detectChinitsu(hand)) yakuIds.add('chinitsu');

    // 役牌の判定
    const yakuhai = detectYakuhai(hand);
    yakuhai.forEach((id) => yakuIds.add(id));

    if (yakuIds.size === 0) {
      return { yakuList: [], totalHan: 0, isYakuman: false };
    }

    let totalHan = 0;
    for (const yaku of YAKU_DEFINITIONS) {
      if (yakuIds.has(yaku.id)) totalHan += yaku.han;
    }

    const yakuList = YAKU_DEFINITIONS.filter((y) => yakuIds.has(y.id));
    return {
      yakuList,
      totalHan: Math.min(totalHan, 13),
      isYakuman: false,
    };
  }

  // 雀頭を特定
  const handMap = new Map<TileType, number>();
  for (const tile of hand) {
    const normalized = normalizeTile(tile);
    handMap.set(normalized, (handMap.get(normalized) ?? 0) + 1);
  }

  let jantou: TileType | null = null;
  for (const [tile, count] of handMap) {
    if (count >= 2) {
      jantou = tile;
      break;
    }
  }

  if (!jantou) {
    return { yakuList: [], totalHan: 0, isYakuman: false };
  }

  // 役の判定
  if (detectRiichi(context)) yakuIds.add('riichi');
  if (detectTanyao(hand)) yakuIds.add('tanyao');
  if (detectPinfu(mentsu, hand, jantou)) yakuIds.add('pinfu');
  if (detectIipekou(mentsu)) yakuIds.add('iipeikou');

  const yakuhai = detectYakuhai(hand);
  yakuhai.forEach((id) => yakuIds.add(id));

  if (detectIkkitsuukan(mentsu)) yakuIds.add('ikkitsuukan');
  if (detectSanshokuDoujun(mentsu)) yakuIds.add('sanshoku_doujun');
  if (detectToitoi(mentsu)) yakuIds.add('toitoi');
  if (
    detectSanankou(
      mentsu,
      context.winningTile,
      context.isTsumo,
    )
  )
    yakuIds.add('sanankou');
  if (detectChanta(mentsu, jantou)) yakuIds.add('chanta');
  if (detectHonitsu(hand)) yakuIds.add('honitsu');
  if (detectChinitsu(hand)) yakuIds.add('chinitsu');
  if (detectJunchan(mentsu, jantou)) yakuIds.add('junchan');
  if (
    detectSuuankou(
      mentsu,
      context.winningTile,
      context.isTsumo,
    )
  )
    yakuIds.add('suuankou');
  if (detectDaisangen(mentsu)) yakuIds.add('daisangen');
  if (detectSankantsu(mentsu)) yakuIds.add('sankantsu');
  if (detectHonroutou(hand, jantou)) yakuIds.add('honroutou');
  if (detectShousangen(mentsu, jantou)) yakuIds.add('shousangen');

  // 検出された役IDから役定義を取得
  const yakuList = YAKU_DEFINITIONS.filter((y) => yakuIds.has(y.id));

  // 翻数を計算
  let totalHan = 0;
  let isYakuman = false;

  for (const yaku of yakuList) {
    if (yaku.isYakuman) {
      isYakuman = true;
      totalHan = Math.max(totalHan, 13);
    } else {
      totalHan += yaku.han;
    }
  }

  return {
    yakuList,
    totalHan: Math.min(totalHan, 13),
    isYakuman,
  };
}
