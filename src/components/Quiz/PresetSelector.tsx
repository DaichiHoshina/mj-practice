'use client';

import { QuizPreset } from '@/lib/quiz/types';
import { QUIZ_PRESETS } from '@/lib/quiz/presets';
import styles from './PresetSelector.module.css';

export interface PresetSelectorProps {
  /** プリセット選択時のコールバック */
  onSelect: (preset: QuizPreset) => void;
  /** 閉じるボタンのコールバック（オプション） */
  onClose?: () => void;
}

/**
 * クイズプリセット選択コンポーネント
 */
export function PresetSelector({ onSelect, onClose }: PresetSelectorProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>クイズ設定を選択</h2>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        )}
      </div>
      <p className={styles.subtitle}>
        難易度と問題数を選んで、あなたに合った練習を始めましょう
      </p>

      <div className={styles.presets}>
        {QUIZ_PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={styles.preset}
            onClick={() => onSelect(preset)}
            style={{ borderColor: preset.color }}
          >
            <div
              className={styles.presetHeader}
              style={{ backgroundColor: preset.color }}
            >
              <span className={styles.emoji}>{preset.emoji}</span>
              {preset.label}
            </div>
            <div className={styles.presetBody}>
              <p className={styles.description}>{preset.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
