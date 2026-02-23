'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MachiQuestion } from '@/lib/quiz/types';
import { TileType } from '@/lib/tiles';
import {
  loadMachiQuestions,
  getMachiCandidates,
  checkMachiAnswer,
} from '@/lib/quiz/machiLoader';
import { Hand } from '../Hand';
import styles from './MachiQuizGame.module.css';

interface MachiQuizGameProps {
  difficulty?: 'easy' | 'medium' | 'hard';
}

type GameState = 'playing' | 'answered' | 'finished';

export function MachiQuizGame({ difficulty }: MachiQuizGameProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<MachiQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTiles, setSelectedTiles] = useState<TileType[]>([]);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [correctCount, setCorrectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadMachiQuestions(difficulty)
      .then((data) => {
        setQuestions(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, [difficulty]);

  if (isLoading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        問題の読み込みに失敗しました: {error.message}
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className={styles.error}>問題が見つかりません</div>;
  }

  const currentQuestion = questions[currentIndex];
  const candidates = getMachiCandidates();

  // 正解の一意な牌のセット
  const uniqueCorrectAnswers = Array.from(
    new Set(currentQuestion.correctAnswers)
  );
  const requiredCount = uniqueCorrectAnswers.length;

  const handleTileClick = (tile: TileType) => {
    if (gameState !== 'playing') return;

    setSelectedTiles((prev) => {
      const index = prev.indexOf(tile);
      if (index >= 0) {
        // 既に選択済みの場合は削除
        return prev.filter((t) => t !== tile);
      } else {
        // 追加
        return [...prev, tile];
      }
    });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    tile: TileType
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTileClick(tile);
    }
  };

  const handleSubmit = () => {
    const isCorrect = checkMachiAnswer(
      selectedTiles,
      currentQuestion.correctAnswers
    );
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
    setGameState('answered');
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedTiles([]);
      setGameState('playing');
    } else {
      setGameState('finished');
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedTiles([]);
    setCorrectCount(0);
    setGameState('playing');
  };

  if (gameState === 'finished') {
    const accuracy = (correctCount / questions.length) * 100;
    return (
      <div className={styles.result}>
        <h2>結果</h2>
        <p className={styles.score}>
          {correctCount} / {questions.length} 問正解
        </p>
        <p className={styles.accuracy}>正解率: {accuracy.toFixed(1)}%</p>
        <div className={styles.actions}>
          <button onClick={handleRestart} className={styles.restartButton}>
            もう一度挑戦
          </button>
          <button
            onClick={() => router.push('/')}
            className={styles.menuButton}
          >
            メニューに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} data-testid="machi-quiz-game">
      <div className={styles.header}>
        <p className={styles.progress} data-testid="progress-bar">
          問題 {currentIndex + 1} / {questions.length}
        </p>
      </div>

      <div className={styles.questionArea}>
        <h3>この手牌の待ち牌は？（{requiredCount}種類）</h3>
        <div className={styles.hand} data-testid="question-hand">
          <Hand hand={currentQuestion.hand} />
        </div>
        {currentQuestion.pattern && (
          <p className={styles.pattern}>パターン: {currentQuestion.pattern}</p>
        )}
      </div>

      <div className={styles.candidateArea}>
        <p className={styles.selectedCount}>
          選択済み: {selectedTiles.length}種類
        </p>
        <div className={styles.candidates} data-testid="candidate-tiles">
          {candidates.map((tile) => {
            const isSelected = selectedTiles.includes(tile);
            const isCorrectAnswer = uniqueCorrectAnswers.includes(tile);

            // 回答後の表示ロジック
            const isCorrectSelection =
              gameState === 'answered' && isSelected && isCorrectAnswer;
            const isWrongSelection =
              gameState === 'answered' && isSelected && !isCorrectAnswer;
            const isCorrectButNotSelected =
              gameState === 'answered' && !isSelected && isCorrectAnswer;

            return (
              <button
                key={tile}
                onClick={() => handleTileClick(tile)}
                onKeyDown={(e) => handleKeyDown(e, tile)}
                disabled={gameState !== 'playing'}
                aria-pressed={isSelected}
                aria-label={`待ち牌候補 ${tile}`}
                className={`${styles.tileButton} ${
                  gameState === 'playing' && isSelected ? styles.selected : ''
                } ${isCorrectSelection ? styles.selected : ''} ${
                  isCorrectButNotSelected ? styles.correctNotSelected : ''
                } ${isWrongSelection ? styles.wrong : ''}`}
              >
                {tile}
              </button>
            );
          })}
        </div>
      </div>

      {gameState === 'playing' && (
        <button onClick={handleSubmit} className={styles.submitButton}>
          回答する
        </button>
      )}

      {gameState === 'answered' &&
        (() => {
          const isCorrect = checkMachiAnswer(
            selectedTiles,
            currentQuestion.correctAnswers
          );
          return (
            <div className={styles.feedback}>
              <p className={isCorrect ? styles.correct : styles.incorrect}>
                {isCorrect ? '✓ 正解！' : '✗ 不正解'}
              </p>
              <div
                className={styles.correctAnswer}
                role="status"
                aria-live="polite"
              >
                <p>正解の待ち牌:</p>
                <div className={styles.correctTiles}>
                  {uniqueCorrectAnswers.map((tile, index) => (
                    <span
                      key={index}
                      className={styles.correctTile}
                      aria-label={`正解 ${tile}`}
                    >
                      {tile}
                    </span>
                  ))}
                </div>
              </div>
              <p className={styles.explanation}>
                {currentQuestion.explanation}
              </p>
              <button onClick={handleNext} className={styles.nextButton}>
                {currentIndex + 1 < questions.length
                  ? '次の問題へ'
                  : '結果を見る'}
              </button>
            </div>
          );
        })()}
    </div>
  );
}
