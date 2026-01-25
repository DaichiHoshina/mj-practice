'use client';

import { Hand as HandType } from '@/lib/hand/types';
import { sortHand } from '@/lib/hand/hand';
import { TileType } from '@/lib/tiles';
import { Tile } from '@/components/Tile';
import styles from './Hand.module.css';

/** Handコンポーネントのプロパティ */
export interface HandProps {
  /** 手牌 */
  hand: HandType;
  /** 牌削除時のコールバック */
  onRemove?: (tile: TileType) => void;
}

/** 手牌の最大枚数（通常は13枚） */
const MAX_HAND_SIZE = 13;

/**
 * 手牌表示コンポーネント
 * 手牌をソートして表示し、クリックで削除できる
 */
export function Hand({ hand, onRemove }: HandProps) {
  // 手牌をソート
  const sortedHand = sortHand(hand);

  /**
   * 牌クリック時のハンドラ
   */
  const handleTileClick = (tile: TileType) => {
    if (onRemove) {
      onRemove(tile);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>手牌</h2>
        <span className={styles.count}>
          {hand.length} / {MAX_HAND_SIZE}枚
        </span>
      </div>

      {hand.length === 0 ? (
        <div className={styles.emptyMessage}>
          牌を選択して手牌に追加してください
        </div>
      ) : (
        <>
          {onRemove && (
            <div className={styles.hint}>クリックで削除できます</div>
          )}
          <div className={styles.tileList}>
            {sortedHand.map((tile, index) => (
              <Tile
                key={`${tile}-${index}`}
                tile={tile}
                onClick={onRemove ? () => handleTileClick(tile) : undefined}
                size="medium"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
