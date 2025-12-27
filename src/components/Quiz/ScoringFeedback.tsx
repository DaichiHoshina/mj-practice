'use client';

import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { ScoringQuestion } from '@/lib/scoring/types';
import styles from './ScoringFeedback.module.css';

export interface ScoringFeedbackProps {
  /** 点数計算問題 */
  question: ScoringQuestion;
  /** ユーザーが選択した答え */
  selectedAnswer: string | null;
  /** 正解かどうか */
  isCorrect: boolean;
}

/**
 * 点数計算のフィードバック表示コンポーネント
 */
export function ScoringFeedback({
  question,
  selectedAnswer,
  isCorrect,
}: ScoringFeedbackProps) {
  // ユーザーが選択した選択肢を取得
  const selectedChoice = question.choices.find((c) => c.id === selectedAnswer);

  return (
    <div className={styles.container}>
      {/* 正解・不正解の表示 */}
      <div
        className={`${styles.resultHeader} ${isCorrect ? styles.correct : styles.incorrect}`}
      >
        <h3 className={styles.resultTitle}>
          {isCorrect ? '✓ 正解！' : '× 不正解'}
        </h3>
        {selectedChoice && (
          <p className={styles.selectedAnswer}>
            あなたの回答: {selectedChoice.label} ({selectedChoice.score}点)
          </p>
        )}
      </div>

      {/* 正解の情報 */}
      <div className={styles.correctAnswer}>
        <h4 className={styles.sectionTitle}>正解</h4>
        <div className={styles.answerDetails}>
          <div className={styles.scoreDisplay}>
            <span className={styles.scoreLabel}>点数:</span>
            <span className={styles.scoreValue}>
              {question.correctAnswer.score}点
            </span>
          </div>
          <div className={styles.hanFuDisplay}>
            <span className={styles.hanFu}>
              {question.correctAnswer.han}翻 {question.correctAnswer.fu}符
            </span>
          </div>
        </div>
      </div>

      {/* 役一覧 */}
      <div className={styles.yakuSection}>
        <h4 className={styles.sectionTitle}>役一覧</h4>
        <div className={styles.yakuList}>
          {question.correctAnswer.yaku.length > 0 ? (
            question.correctAnswer.yaku.map((yaku, index) => (
              <div key={`${yaku}-${index}`} className={styles.yakuItem}>
                <span className={styles.yakuName}>{yaku}</span>
                {/* 翻数は将来的に役データから取得 */}
                <span className={styles.yakuHan}>-翻</span>
              </div>
            ))
          ) : (
            <p className={styles.emptyMessage}>役情報がありません</p>
          )}
        </div>
      </div>

      {/* 符内訳（骨格） */}
      <div className={styles.fuSection}>
        <h4 className={styles.sectionTitle}>符の内訳</h4>
        <div className={styles.fuBreakdown}>
          <div className={styles.fuItem}>
            <span className={styles.fuLabel}>副底:</span>
            <span className={styles.fuValue}>20符</span>
          </div>
          <div className={styles.fuItem}>
            <span className={styles.fuLabel}>面子符:</span>
            <span className={styles.fuValue}>-符</span>
          </div>
          <div className={styles.fuItem}>
            <span className={styles.fuLabel}>雀頭符:</span>
            <span className={styles.fuValue}>-符</span>
          </div>
          <div className={styles.fuItem}>
            <span className={styles.fuLabel}>待ち符:</span>
            <span className={styles.fuValue}>-符</span>
          </div>
          <div className={styles.fuTotal}>
            <span className={styles.fuLabel}>合計:</span>
            <span className={styles.fuValue}>{question.correctAnswer.fu}符</span>
          </div>
        </div>
      </div>

      {/* 計算式（骨格） */}
      <div className={styles.calculationSection}>
        <h4 className={styles.sectionTitle}>計算式</h4>
        <div className={styles.calculation}>
          <p className={styles.formula}>
            基本点 = {question.correctAnswer.fu}符 × 2^
            {question.correctAnswer.han + 2} = [計算中]点
          </p>
          <p className={styles.formula}>
            {question.isDealer ? '親' : '子'}の
            {question.isTsumo ? 'ツモ' : 'ロン'} ={' '}
            {question.correctAnswer.score}点
          </p>
        </div>
      </div>

      {/* 解説（Markdown表示） */}
      <div className={styles.explanationSection}>
        <h4 className={styles.sectionTitle}>解説</h4>
        <div className={styles.explanation}>
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
            {question.explanation}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
