'use client';

import type { ShantenResult, EffectiveTile } from '@/lib/shanten';
import { TileType } from '@/lib/tiles';
import { Tile } from '@/components/Tile';
import styles from './ShantenDisplay.module.css';

/** ShantenDisplayコンポーネントのプロパティ */
export interface ShantenDisplayProps {
  /** 向聴数計算結果 */
  result: ShantenResult;
  /** 有効牌一覧 */
  effectiveTiles: readonly EffectiveTile[];
}

/**
 * 向聴数と有効牌を表示するコンポーネント
 */
export function ShantenDisplay({
  result,
  effectiveTiles,
}: ShantenDisplayProps) {
  // 向聴数の表示テキスト
  const getShantenText = (): string => {
    if (result.isComplete) {
      return '和了！';
    }
    if (result.isReady) {
      return 'テンパイ！';
    }
    return `${result.shanten}向聴`;
  };

  // 受け入れ枚数の合計
  const totalAcceptance = effectiveTiles.reduce(
    (sum, tile) => sum + tile.remaining,
    0
  );

  // 向聴数に応じたクラス名
  const shantenClass = result.isComplete
    ? styles.complete
    : result.isReady
      ? styles.ready
      : styles.shanten;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>向聴数</h2>
        <div className={`${styles.shantenValue} ${shantenClass}`}>
          {getShantenText()}
        </div>
      </div>

      {effectiveTiles.length > 0 && (
        <div className={styles.effectiveSection}>
          <h3 className={styles.sectionTitle}>
            有効牌（{effectiveTiles.length}種 / {totalAcceptance}枚）
          </h3>
          <div className={styles.tileList}>
            {effectiveTiles.map((item) => (
              <div key={item.tile} className={styles.tileItem}>
                <Tile tile={item.tile as TileType} size="medium" />
                <span className={styles.remaining}>{item.remaining}枚</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {effectiveTiles.length === 0 && !result.isComplete && (
        <div className={styles.noEffective}>
          有効牌がありません（手牌を確認してください）
        </div>
      )}

      {result.isComplete && (
        <div className={styles.completeMessage}>
          おめでとうございます！手牌が和了形です。
        </div>
      )}
    </div>
  );
}
