'use client';

import { QuizDifficulty } from '@/lib/quiz/types';
import styles from './DifficultySelector.module.css';

export interface DifficultySelectorProps {
  /** 難易度選択時のコールバック */
  onSelect: (difficulty: QuizDifficulty) => void;
}

interface DifficultyOption {
  value: QuizDifficulty;
  label: string;
  description: string;
  color: string;
}

const difficulties: DifficultyOption[] = [
  {
    value: 'easy',
    label: '初級',
    description: '基本的な向聴数の問題',
    color: '#388e3c',
  },
  {
    value: 'medium',
    label: '中級',
    description: '少し複雑な向聴数の問題',
    color: '#1976d2',
  },
  {
    value: 'hard',
    label: '上級',
    description: '難しい向聴数の問題',
    color: '#d32f2f',
  },
];

/**
 * 難易度選択コンポーネント
 */
export function DifficultySelector({ onSelect }: DifficultySelectorProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>難易度を選択してください</h2>
      <p className={styles.subtitle}>
        あなたのレベルに合った問題で麻雀の向聴数を学びましょう
      </p>

      <div className={styles.options}>
        {difficulties.map((difficulty) => (
          <button
            key={difficulty.value}
            className={styles.option}
            onClick={() => onSelect(difficulty.value)}
            style={{ borderColor: difficulty.color }}
          >
            <div
              className={styles.optionHeader}
              style={{ backgroundColor: difficulty.color }}
            >
              {difficulty.label}
            </div>
            <div className={styles.optionBody}>
              <p className={styles.description}>{difficulty.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
