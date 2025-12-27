/**
 * 手牌管理モジュール
 * @module hand
 */

// 型定義のエクスポート
export type {
  Hand,
  HandValidationResult,
  AddTileResult,
  RemoveTileResult,
} from './types';

// 関数のエクスポート
export {
  createHand,
  addTile,
  removeTile,
  validateHand,
  sortHand,
  countTile,
} from './hand';
