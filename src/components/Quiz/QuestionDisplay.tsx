'use client';

import { Question } from '@/lib/quiz/types';
import { Tile } from '@/components/Tile';
import styles from './QuestionDisplay.module.css';

export interface QuestionDisplayProps {
  /** 問題 */
  question: Question;
  /** 現在の問題番号（1から始まる） */
  currentNumber: number;
  /** 総問題数 */
  totalQuestions: number;
}

/**
 * クイズの問題表示コンポーネント
 */
export function QuestionDisplay({
  question,
  currentNumber,
  totalQuestions,
}: QuestionDisplayProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.progress}>
          問題 {currentNumber} / {totalQuestions}
        </span>
        <span className={styles.difficulty}>
          難易度: {getDifficultyLabel(question.difficulty)}
        </span>
      </div>

      <h2 className={styles.title}>{question.title}</h2>

      <div className={styles.handContainer}>
        <div className={styles.handLabel}>手牌:</div>
        <div className={styles.tiles}>
          {question.hand.map((tile, index) => (
            <Tile key={`${tile}-${index}`} tile={tile} size="medium" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 難易度ラベルを取得
 */
function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return '初級';
    case 'medium':
      return '中級';
    case 'hard':
      return '上級';
    default:
      return difficulty;
  }
}
