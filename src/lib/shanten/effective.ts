/**
 * 有効牌計算モジュール
 *
 * 向聴数を下げる有効牌を計算し、各有効牌の改善度と残り枚数を提供
 */

import { Hand } from '../hand';
import { TileType, ALL_GAME_TILES } from '../tiles';
import { calculateShanten } from './calculator';

/**
 * 有効牌情報
 */
export interface EffectiveTile {
  /** 牌の種類 */
  readonly tile: TileType;
  /** 改善度（向聴数がどれだけ下がるか） */
  readonly improvement: number;
  /** 残り枚数（4枚 - 手牌内枚数） */
  readonly remaining: number;
}

/**
 * 有効牌を計算
 * @param hand 手牌（13枚）
 * @returns 有効牌の配列（向聴数を下げる牌のみ）
 */
export function getEffectiveTiles(hand: Hand): readonly EffectiveTile[] {
  // 手牌が13枚でない場合は空配列を返す
  if (hand.length !== 13) {
    return [];
  }

  // 元の向聴数を計算
  const currentShanten = calculateShanten(hand).shanten;

  // 手牌内の各牌の枚数をカウント
  const tileCountMap = new Map<TileType, number>();
  for (const tile of hand) {
    tileCountMap.set(tile, (tileCountMap.get(tile) ?? 0) + 1);
  }

  const effectiveTiles: EffectiveTile[] = [];

  // 全ゲーム用牌（34種）をループ
  for (const tile of ALL_GAME_TILES) {
    // 牌を手牌に追加
    const newHand: Hand = [...hand, tile];

    // 新しい向聴数を計算
    const newShanten = calculateShanten(newHand).shanten;

    // 向聴数が下がる場合のみ有効牌として抽出
    if (newShanten < currentShanten) {
      const improvement = currentShanten - newShanten;
      const countInHand = tileCountMap.get(tile) ?? 0;
      const remaining = 4 - countInHand;

      effectiveTiles.push({
        tile,
        improvement,
        remaining,
      });
    }
  }

  return effectiveTiles;
}
