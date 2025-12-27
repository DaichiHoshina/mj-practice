'use client';

import { QuizResult } from '@/lib/quiz/types';
import styles from './ScoreBoard.module.css';
import { useEffect } from 'react';

export interface ScoreBoardProps {
  /** クイズ結果 */
  result: QuizResult;
  /** もう一度プレイするボタンのハンドラ */
  onRestart: () => void;
  /** 終了ボタンのハンドラ */
  onExit: () => void;
}

/**
 * クイズの成績表示コンポーネント
 */
export function ScoreBoard({ result, onRestart, onExit }: ScoreBoardProps) {
  // ローカルストレージに結果を保存
  useEffect(() => {
    const existingResults = localStorage.getItem('quizResults');
    const results = existingResults ? JSON.parse(existingResults) : [];

    results.push({
      date: new Date().toISOString(),
      totalQuestions: result.totalQuestions,
      correctCount: result.correctCount,
      accuracy: result.accuracy,
    });

    // 最新10件のみ保持
    const latestResults = results.slice(-10);
    localStorage.setItem('quizResults', JSON.stringify(latestResults));
  }, [result]);

  const getAccuracyClass = () => {
    if (result.accuracy >= 80) return styles.excellent;
    if (result.accuracy >= 60) return styles.good;
    return styles.needsImprovement;
  };

  const getMessage = () => {
    if (result.accuracy >= 80) return '素晴らしい！';
    if (result.accuracy >= 60) return 'よくできました！';
    return 'もう少し頑張りましょう！';
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>クイズ結果</h2>

      <div className={styles.scoreContainer}>
        <div className={`${styles.accuracy} ${getAccuracyClass()}`}>
          {result.accuracy.toFixed(1)}%
        </div>
        <div className={styles.message}>{getMessage()}</div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <span className={styles.label}>総問題数:</span>
          <span className={styles.value}>{result.totalQuestions}問</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.label}>正解数:</span>
          <span className={styles.value}>{result.correctCount}問</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.label}>不正解数:</span>
          <span className={styles.value}>
            {result.totalQuestions - result.correctCount}問
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.restartButton} onClick={onRestart}>
          もう一度
        </button>
        <button className={styles.exitButton} onClick={onExit}>
          終了
        </button>
      </div>
    </div>
  );
}
