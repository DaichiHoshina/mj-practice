/**
 * 手牌管理ロジック
 */

import { TileType } from '../tiles';
import {
  Hand,
  HandValidationResult,
  AddTileResult,
  RemoveTileResult,
} from './types';

/** 手牌の通常最大枚数（ツモ前） */
const _MAX_HAND_SIZE = 13;

/** 各牌の最大枚数（麻雀は各牌4枚まで） */
const MAX_TILE_COUNT = 4;

/** 手牌の最大枚数（ツモ時） */
const MAX_HAND_SIZE_WITH_DRAW = 14;

/** ゲームで使用される牌（BACK, FRONT, BLANKを除く） */
const GAME_TILES = new Set<TileType>([
  // 萬子
  TileType.MAN1,
  TileType.MAN2,
  TileType.MAN3,
  TileType.MAN4,
  TileType.MAN5,
  TileType.MAN6,
  TileType.MAN7,
  TileType.MAN8,
  TileType.MAN9,
  // 筒子
  TileType.PIN1,
  TileType.PIN2,
  TileType.PIN3,
  TileType.PIN4,
  TileType.PIN5,
  TileType.PIN6,
  TileType.PIN7,
  TileType.PIN8,
  TileType.PIN9,
  // 索子
  TileType.SOU1,
  TileType.SOU2,
  TileType.SOU3,
  TileType.SOU4,
  TileType.SOU5,
  TileType.SOU6,
  TileType.SOU7,
  TileType.SOU8,
  TileType.SOU9,
  // 字牌
  TileType.TON,
  TileType.NAN,
  TileType.SHAA,
  TileType.PEI,
  TileType.HAKU,
  TileType.HATSU,
  TileType.CHUN,
  // 赤ドラ
  TileType.MAN5_DORA,
  TileType.PIN5_DORA,
  TileType.SOU5_DORA,
]);

/**
 * 空の手牌を作成
 * @returns 空の手牌
 */
export function createHand(): Hand {
  return [];
}

/**
 * 手牌に牌を追加
 * @param hand 現在の手牌
 * @param tile 追加する牌
 * @returns 追加結果
 */
export function addTile(hand: Hand, tile: TileType): AddTileResult {
  // ゲーム用の牌かチェック
  if (!GAME_TILES.has(tile)) {
    return {
      success: false,
      error: `無効な牌です: ${tile}`,
    };
  }

  // 13枚上限チェック（ツモ時は14枚まで許容）
  if (hand.length >= MAX_HAND_SIZE_WITH_DRAW) {
    return {
      success: false,
      error: `手牌の上限（${MAX_HAND_SIZE_WITH_DRAW}枚）を超えています`,
    };
  }

  // 特定牌の4枚上限チェック
  const currentCount = countTile(hand, tile);
  if (currentCount >= MAX_TILE_COUNT) {
    return {
      success: false,
      error: `同じ牌は${MAX_TILE_COUNT}枚までです: ${tile}`,
    };
  }

  // イミュータブルに追加
  const newHand: Hand = [...hand, tile];

  return {
    success: true,
    hand: newHand,
  };
}

/**
 * 手牌から牌を削除
 * @param hand 現在の手牌
 * @param tile 削除する牌
 * @returns 削除結果
 */
export function removeTile(hand: Hand, tile: TileType): RemoveTileResult {
  // 牌が存在するかチェック
  const index = hand.indexOf(tile);
  if (index === -1) {
    return {
      success: false,
      error: `指定された牌が手牌に存在しません: ${tile}`,
    };
  }

  // イミュータブルに削除（最初に見つかった1枚のみ）
  const newHand: Hand = [...hand.slice(0, index), ...hand.slice(index + 1)];

  return {
    success: true,
    hand: newHand,
  };
}

/**
 * 手牌のバリデーション
 * @param hand 検証する手牌
 * @returns バリデーション結果
 */
export function validateHand(hand: Hand): HandValidationResult {
  const errors: string[] = [];

  // 枚数チェック（0-14枚の範囲）
  if (hand.length > MAX_HAND_SIZE_WITH_DRAW) {
    errors.push(`手牌の枚数が多すぎます（最大${MAX_HAND_SIZE_WITH_DRAW}枚）`);
  }

  // 各牌の枚数チェック
  const tileCounts = new Map<TileType, number>();
  for (const tile of hand) {
    // ゲーム用の牌かチェック
    if (!GAME_TILES.has(tile)) {
      errors.push(`無効な牌が含まれています: ${tile}`);
      continue;
    }

    const count = tileCounts.get(tile) ?? 0;
    tileCounts.set(tile, count + 1);

    if (count + 1 > MAX_TILE_COUNT) {
      errors.push(`同じ牌が${MAX_TILE_COUNT}枚を超えています: ${tile}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 牌の優先順位を取得（ソート用）
 * 萬子 → 筒子 → 索子 → 字牌の順
 */
function getTilePriority(tile: TileType): number {
  const tileStr = tile as string;

  // 萬子 (1m-9m, 0m)
  if (tileStr.endsWith('m')) {
    const num = tileStr.slice(0, -1);
    return num === '0' ? 5 : parseInt(num, 10); // 赤5萬は5萬と同じ優先度
  }

  // 筒子 (1p-9p, 0p)
  if (tileStr.endsWith('p')) {
    const num = tileStr.slice(0, -1);
    return 10 + (num === '0' ? 5 : parseInt(num, 10));
  }

  // 索子 (1s-9s, 0s)
  if (tileStr.endsWith('s')) {
    const num = tileStr.slice(0, -1);
    return 20 + (num === '0' ? 5 : parseInt(num, 10));
  }

  // 字牌（固定順序）
  const honorOrder: Record<string, number> = {
    ton: 30,
    nan: 31,
    shaa: 32,
    pei: 33,
    haku: 34,
    hatsu: 35,
    chun: 36,
  };

  return honorOrder[tileStr] ?? 999; // 不明な牌は最後
}

/**
 * 手牌をソート
 * 萬子 → 筒子 → 索子 → 字牌の順でソート
 * @param hand ソートする手牌
 * @returns ソート済み手牌
 */
export function sortHand(hand: Hand): Hand {
  // イミュータブルにソート
  return [...hand].sort((a, b) => getTilePriority(a) - getTilePriority(b));
}

/**
 * 特定牌の枚数をカウント
 * @param hand 手牌
 * @param tile カウントする牌
 * @returns 枚数
 */
export function countTile(hand: Hand, tile: TileType): number {
  return hand.filter((t) => t === tile).length;
}
