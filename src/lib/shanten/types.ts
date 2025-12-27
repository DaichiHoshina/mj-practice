/**
 * 向聴数計算の型定義
 */

/**
 * 向聴数計算結果
 */
export interface ShantenResult {
  /** 向聴数（-1: 和了, 0: 聴牌, 1以上: N向聴） */
  readonly shanten: number;
  /** 聴牌状態フラグ（向聴数0） */
  readonly isReady: boolean;
  /** 和了状態フラグ（向聴数-1） */
  readonly isComplete: boolean;
}
