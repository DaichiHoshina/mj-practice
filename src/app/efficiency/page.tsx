'use client';

import { useState, useMemo } from 'react';
import { Hand } from '@/lib/hand/types';
import { TileType } from '@/lib/tiles';
import { calculateShanten, getEffectiveTiles } from '@/lib/shanten';
import { TileSelector } from '@/components/TileSelector';
import { Hand as HandComponent } from '@/components/Hand';
import { ShantenDisplay } from '@/components/ShantenDisplay';
import styles from './page.module.css';

export default function EfficiencyPage() {
  const [hand, setHand] = useState<Hand>([]);

  // 牌を追加
  const addTile = (tile: TileType) => {
    if (hand.length < 13) {
      setHand([...hand, tile]);
    }
  };

  // 牌を削除
  const removeTile = (tile: TileType) => {
    const index = hand.indexOf(tile);
    if (index !== -1) {
      const newHand = [...hand];
      newHand.splice(index, 1);
      setHand(newHand);
    }
  };

  // 向聴数を自動計算
  const shantenResult = useMemo(() => {
    if (hand.length === 0) {
      return { shanten: 8, isReady: false, isComplete: false };
    }
    return calculateShanten(hand);
  }, [hand]);

  // 有効牌を自動計算
  const effectiveTiles = useMemo(() => {
    if (hand.length === 0 || shantenResult.isComplete) {
      return [];
    }
    return getEffectiveTiles(hand);
  }, [hand, shantenResult.isComplete]);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>麻雀向聴数計算</h1>
        <p className={styles.description}>
          牌を選択して手牌を作成すると、向聴数と有効牌が自動的に表示されます
        </p>
      </header>

      <div className={styles.content}>
        <TileSelector hand={hand} onSelect={addTile} />
        <HandComponent hand={hand} onRemove={removeTile} />
        <ShantenDisplay
          result={shantenResult}
          effectiveTiles={effectiveTiles}
        />
      </div>
    </main>
  );
}
