/**
 * 向聴数計算ロジック
 */

import { Hand } from '../hand';
import { TileType } from '../tiles';
import { ShantenResult } from './types';

/**
 * 牌の種類ごとの枚数を管理するマップ
 */
type TileCountMap = Map<TileType, number>;

/**
 * 面子・搭子の組み合わせ状態
 */
interface MentsuState {
  /** 完成した面子の数 */
  mentsu: number;
  /** 搭子の数 */
  tatsu: number;
  /** 雀頭が存在するか */
  hasJantou: boolean;
}

/**
 * 手牌から牌の枚数マップを作成
 */
function createTileCountMap(hand: Hand): TileCountMap {
  const map = new Map<TileType, number>();
  for (const tile of hand) {
    map.set(tile, (map.get(tile) ?? 0) + 1);
  }
  return map;
}

/**
 * 牌を種類ごとにグループ化（萬子・筒子・索子・字牌）
 */
function groupTilesByType(tileMap: TileCountMap): {
  man: Map<number, number>;
  pin: Map<number, number>;
  sou: Map<number, number>;
  honor: Map<TileType, number>;
} {
  const man = new Map<number, number>();
  const pin = new Map<number, number>();
  const sou = new Map<number, number>();
  const honor = new Map<TileType, number>();

  for (const [tile, count] of tileMap) {
    const value = tile as string;
    if (value.endsWith('m')) {
      const num = parseInt(value[0], 10);
      if (!isNaN(num)) {
        man.set(num, count);
      }
    } else if (value.endsWith('p')) {
      const num = parseInt(value[0], 10);
      if (!isNaN(num)) {
        pin.set(num, count);
      }
    } else if (value.endsWith('s')) {
      const num = parseInt(value[0], 10);
      if (!isNaN(num)) {
        sou.set(num, count);
      }
    } else {
      // 字牌または赤ドラ
      honor.set(tile, count);
    }
  }

  return { man, pin, sou, honor };
}

/**
 * 数牌の面子・搭子を再帰的に計算
 */
function analyzeNumberTiles(
  tiles: Map<number, number>,
  num: number,
  currentState: MentsuState
): MentsuState {
  // 1から9までの牌を順番に処理
  if (num > 9) {
    return currentState;
  }

  const count = tiles.get(num) ?? 0;
  if (count === 0) {
    return analyzeNumberTiles(tiles, num + 1, currentState);
  }

  let bestState = currentState;

  // 刻子を作る（同じ牌3枚）
  if (count >= 3) {
    const newTiles = new Map(tiles);
    newTiles.set(num, count - 3);
    const newState = analyzeNumberTiles(newTiles, num, {
      mentsu: currentState.mentsu + 1,
      tatsu: currentState.tatsu,
      hasJantou: currentState.hasJantou,
    });
    if (
      calculateShantenFromState(newState) < calculateShantenFromState(bestState)
    ) {
      bestState = newState;
    }
  }

  // 順子を作る（連続3枚）
  const next1 = tiles.get(num + 1) ?? 0;
  const next2 = tiles.get(num + 2) ?? 0;
  if (next1 > 0 && next2 > 0) {
    const newTiles = new Map(tiles);
    newTiles.set(num, count - 1);
    newTiles.set(num + 1, next1 - 1);
    newTiles.set(num + 2, next2 - 1);
    const newState = analyzeNumberTiles(newTiles, num, {
      mentsu: currentState.mentsu + 1,
      tatsu: currentState.tatsu,
      hasJantou: currentState.hasJantou,
    });
    if (
      calculateShantenFromState(newState) < calculateShantenFromState(bestState)
    ) {
      bestState = newState;
    }
  }

  // 対子を作る（雀頭候補または搭子）
  if (count >= 2) {
    const newTiles = new Map(tiles);
    newTiles.set(num, count - 2);

    // 雀頭として使う
    if (!currentState.hasJantou) {
      const newState = analyzeNumberTiles(newTiles, num, {
        mentsu: currentState.mentsu,
        tatsu: currentState.tatsu,
        hasJantou: true,
      });
      if (
        calculateShantenFromState(newState) <
        calculateShantenFromState(bestState)
      ) {
        bestState = newState;
      }
    }

    // 搭子として使う（面子が4つ未満の場合）
    if (currentState.mentsu + currentState.tatsu < 4) {
      const newState = analyzeNumberTiles(newTiles, num, {
        mentsu: currentState.mentsu,
        tatsu: currentState.tatsu + 1,
        hasJantou: currentState.hasJantou,
      });
      if (
        calculateShantenFromState(newState) <
        calculateShantenFromState(bestState)
      ) {
        bestState = newState;
      }
    }
  }

  // 両面・嵌張搭子を作る
  if (count >= 1 && currentState.mentsu + currentState.tatsu < 4) {
    // 両面・嵌張（次の牌が1枚以上）
    if (next1 > 0) {
      const newTiles = new Map(tiles);
      newTiles.set(num, count - 1);
      newTiles.set(num + 1, next1 - 1);
      const newState = analyzeNumberTiles(newTiles, num, {
        mentsu: currentState.mentsu,
        tatsu: currentState.tatsu + 1,
        hasJantou: currentState.hasJantou,
      });
      if (
        calculateShantenFromState(newState) <
        calculateShantenFromState(bestState)
      ) {
        bestState = newState;
      }
    }

    // 嵌張（2つ先の牌が1枚以上）
    if (next2 > 0) {
      const newTiles = new Map(tiles);
      newTiles.set(num, count - 1);
      newTiles.set(num + 2, next2 - 1);
      const newState = analyzeNumberTiles(newTiles, num, {
        mentsu: currentState.mentsu,
        tatsu: currentState.tatsu + 1,
        hasJantou: currentState.hasJantou,
      });
      if (
        calculateShantenFromState(newState) <
        calculateShantenFromState(bestState)
      ) {
        bestState = newState;
      }
    }
  }

  // 何も使わずに次へ
  const skipState = analyzeNumberTiles(tiles, num + 1, currentState);
  if (
    calculateShantenFromState(skipState) < calculateShantenFromState(bestState)
  ) {
    bestState = skipState;
  }

  return bestState;
}

/**
 * 字牌の面子・搭子を計算（刻子と対子のみ）
 */
function analyzeHonorTiles(
  tiles: Map<TileType, number>,
  currentState: MentsuState
): MentsuState {
  const state = { ...currentState };

  for (const [, count] of tiles) {
    if (count >= 3) {
      // 刻子
      state.mentsu++;
    } else if (count === 2) {
      // 雀頭または対子搭子
      if (!state.hasJantou) {
        state.hasJantou = true;
      } else if (state.mentsu + state.tatsu < 4) {
        state.tatsu++;
      }
    }
  }

  return state;
}

/**
 * 状態から向聴数を計算
 */
function calculateShantenFromState(state: MentsuState): number {
  const { mentsu, tatsu, hasJantou } = state;

  // 向聴数 = 8 - (面子数×2) - 搭子数 - 雀頭あり
  const jantouValue = hasJantou ? 1 : 0;
  const effectiveTatsu = Math.min(tatsu, 4 - mentsu);

  return 8 - mentsu * 2 - effectiveTatsu - jantouValue;
}

/**
 * 向聴数を計算
 * @param hand 手牌（13枚または14枚）
 * @returns 向聴数計算結果
 */
export function calculateShanten(hand: Hand): ShantenResult {
  // 牌の枚数をカウント
  const tileMap = createTileCountMap(hand);

  // 種類ごとにグループ化
  const { man, pin, sou, honor } = groupTilesByType(tileMap);

  // 初期状態
  const initialState: MentsuState = {
    mentsu: 0,
    tatsu: 0,
    hasJantou: false,
  };

  // 各種類の牌を分析
  let bestShanten = Infinity;

  // 萬子・筒子・索子を組み合わせて分析
  const manState = analyzeNumberTiles(man, 1, initialState);
  const pinState = analyzeNumberTiles(pin, 1, {
    mentsu: manState.mentsu,
    tatsu: manState.tatsu,
    hasJantou: manState.hasJantou,
  });
  const souState = analyzeNumberTiles(sou, 1, {
    mentsu: pinState.mentsu,
    tatsu: pinState.tatsu,
    hasJantou: pinState.hasJantou,
  });
  const finalState = analyzeHonorTiles(honor, souState);

  const shanten = calculateShantenFromState(finalState);
  bestShanten = Math.min(bestShanten, shanten);

  return {
    shanten: bestShanten,
    isReady: bestShanten === 0,
    isComplete: bestShanten === -1,
  };
}
