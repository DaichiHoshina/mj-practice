'use client';

import { TileType, NUMBER_TILES, HONOR_TILES } from '@/lib/tiles';
import { Hand } from '@/lib/hand/types';
import { countTile } from '@/lib/hand/hand';
import { Tile } from '@/components/Tile';
import styles from './TileSelector.module.css';

/** TileSelectorコンポーネントのプロパティ */
export interface TileSelectorProps {
  /** 現在の手牌 */
  hand: Hand;
  /** 牌選択時のコールバック */
  onSelect: (tile: TileType) => void;
}

/** 各牌の最大枚数（麻雀は各牌4枚まで） */
const MAX_TILE_COUNT = 4;

/**
 * 牌選択UIコンポーネント
 * 全34種の牌を表示し、クリックで手牌に追加できる
 */
export function TileSelector({ hand, onSelect }: TileSelectorProps) {
  /**
   * 牌の残り枚数を計算
   */
  const getRemainingCount = (tile: TileType): number => {
    const usedCount = countTile(hand, tile);
    return MAX_TILE_COUNT - usedCount;
  };

  /**
   * 牌が選択可能かどうか
   */
  const isTileSelectable = (tile: TileType): boolean => {
    return getRemainingCount(tile) > 0;
  };

  /**
   * 牌のレンダリング
   */
  const renderTile = (tile: TileType) => {
    const remainingCount = getRemainingCount(tile);
    const disabled = !isTileSelectable(tile);

    return (
      <div key={tile} className={styles.tileItem}>
        <Tile
          tile={tile}
          onClick={() => onSelect(tile)}
          disabled={disabled}
          size="small"
        />
        <span className={disabled ? styles.countDisabled : styles.count}>
          {remainingCount}
        </span>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>牌を選択</h2>

      {/* 数牌セクション */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>数牌（萬子・筒子・索子）</h3>
        <div className={styles.tileGrid}>
          {NUMBER_TILES.map((tile) => renderTile(tile))}
        </div>
      </div>

      {/* 字牌セクション */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>字牌（風牌・三元牌）</h3>
        <div className={styles.tileGrid}>
          {HONOR_TILES.map((tile) => renderTile(tile))}
        </div>
      </div>
    </div>
  );
}
