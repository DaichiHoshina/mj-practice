'use client';

import { ScoringQuestion } from '@/lib/scoring/types';
import { Tile } from '@/components/Tile';
import styles from './ScoringQuestionDisplay.module.css';

export interface ScoringQuestionDisplayProps {
  /** 点数計算問題 */
  question: ScoringQuestion;
  /** 現在の問題番号（1から始まる） */
  currentNumber: number;
  /** 総問題数 */
  totalQuestions: number;
}

/**
 * 点数計算問題の表示コンポーネント
 */
export function ScoringQuestionDisplay({
  question,
  currentNumber,
  totalQuestions,
}: ScoringQuestionDisplayProps) {
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

      {/* 手牌表示（和了牌をハイライト） */}
      <div className={styles.handContainer}>
        <div className={styles.handLabel}>手牌:</div>
        <div className={styles.tiles}>
          {question.hand.map((tile, index) => (
            <div
              key={`${tile}-${index}`}
              className={
                tile === question.winningTile
                  ? styles.winningTile
                  : styles.normalTile
              }
            >
              <Tile tile={tile} size="medium" />
              {tile === question.winningTile && (
                <span className={styles.winningLabel}>和了牌</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ドラ表示牌 */}
      {question.dora.length > 0 && (
        <div className={styles.doraContainer}>
          <div className={styles.doraLabel}>ドラ表示牌:</div>
          <div className={styles.tiles}>
            {question.dora.map((tile, index) => (
              <div key={`dora-${tile}-${index}`} className={styles.doraTile}>
                <Tile tile={tile} size="medium" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 場況表示 */}
      <div className={styles.situationContainer}>
        <div className={styles.situationGrid}>
          <div className={styles.situationItem}>
            <span className={styles.situationLabel}>局:</span>
            <span className={styles.situationValue}>
              {getWindLabel(question.situation.roundWind)}場
            </span>
          </div>
          <div className={styles.situationItem}>
            <span className={styles.situationLabel}>自風:</span>
            <span className={styles.situationValue}>
              {getWindLabel(question.situation.seatWind)}
            </span>
          </div>
          <div className={styles.situationItem}>
            <span className={styles.situationLabel}>家:</span>
            <span className={styles.situationValue}>
              {question.isDealer ? '親' : '子'}
            </span>
          </div>
          <div className={styles.situationItem}>
            <span className={styles.situationLabel}>和了方法:</span>
            <span className={styles.situationValue}>
              {question.isTsumo ? 'ツモ' : 'ロン'}
            </span>
          </div>
          {question.isRiichi && (
            <div className={styles.situationItem}>
              <span className={styles.situationLabel}>状態:</span>
              <span className={styles.situationValue}>リーチ</span>
            </div>
          )}
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

/**
 * 風ラベルを取得
 */
function getWindLabel(wind: 'ton' | 'nan' | 'shaa' | 'pei'): string {
  switch (wind) {
    case 'ton':
      return '東';
    case 'nan':
      return '南';
    case 'shaa':
      return '西';
    case 'pei':
      return '北';
    default:
      return wind;
  }
}
