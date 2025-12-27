/**
 * 手牌（てはい）の型定義
 */

import { TileType } from '../tiles';

/**
 * 手牌型
 * TileTypeの配列として定義（通常13枚、ツモ時14枚）
 */
export type Hand = readonly TileType[];

/**
 * 手牌バリデーション結果
 */
export interface HandValidationResult {
  /** バリデーション成功フラグ */
  readonly isValid: boolean;
  /** エラーメッセージ配列 */
  readonly errors: readonly string[];
}

/**
 * 牌の追加結果
 */
export interface AddTileResult {
  /** 追加成功フラグ */
  readonly success: boolean;
  /** 追加後の手牌（成功時） */
  readonly hand?: Hand;
  /** エラーメッセージ（失敗時） */
  readonly error?: string;
}

/**
 * 牌の削除結果
 */
export interface RemoveTileResult {
  /** 削除成功フラグ */
  readonly success: boolean;
  /** 削除後の手牌（成功時） */
  readonly hand?: Hand;
  /** エラーメッセージ（失敗時） */
  readonly error?: string;
}
