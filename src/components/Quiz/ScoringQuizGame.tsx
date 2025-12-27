'use client';

import { useState, useMemo } from 'react';
import { ScoringQuestion } from '@/lib/scoring/types';
import { QuizDifficulty } from '@/lib/quiz/types';
import { loadScoringQuestions } from '@/lib/quiz/loader';
import { ScoringQuestionDisplay } from './ScoringQuestionDisplay';
import { ScoringFeedback } from './ScoringFeedback';
import { DifficultySelector } from './DifficultySelector';
import { ScoreBoard } from './ScoreBoard';
import styles from './ScoringQuizGame.module.css';

type GameState = 'selection' | 'playing' | 'feedback' | 'finished';

interface ScoringQuizSession {
  readonly questions: readonly ScoringQuestion[];
  currentIndex: number;
  readonly answers: ReadonlyMap<string, string>;
  readonly startTime: Date;
}

interface ScoringQuizResult {
  readonly totalQuestions: number;
  readonly correctCount: number;
  readonly accuracy: number;
  readonly incorrectQuestionIds: readonly string[];
}

/**
 * 点数計算クイズゲーム全体を管理するコンポーネント
 */
export function ScoringQuizGame() {
  const [gameState, setGameState] = useState<GameState>('selection');
  const [session, setSession] = useState<ScoringQuizSession | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // 現在の問題を取得
  const currentQuestion = useMemo(() => {
    if (!session || session.currentIndex >= session.questions.length) {
      return null;
    }
    return session.questions[session.currentIndex];
  }, [session]);

  // 難易度選択ハンドラ
  const handleDifficultySelect = (difficulty: QuizDifficulty) => {
    const questions = loadScoringQuestions(difficulty, 10);
    const newSession: ScoringQuizSession = {
      questions,
      currentIndex: 0,
      answers: new Map(),
      startTime: new Date(),
    };
    setSession(newSession);
    setGameState('playing');
  };

  // 選択肢選択ハンドラ
  const handleChoiceSelect = (choiceId: string) => {
    if (gameState !== 'playing') return;

    setSelectedAnswer(choiceId);
    setGameState('feedback');
  };

  // 次の問題へ進むハンドラ
  const handleNext = () => {
    if (!session) return;

    const newAnswers = new Map(session.answers);
    if (selectedAnswer && currentQuestion) {
      newAnswers.set(currentQuestion.id, selectedAnswer);
    }

    const newSession: ScoringQuizSession = {
      ...session,
      currentIndex: session.currentIndex + 1,
      answers: newAnswers,
    };

    setSession(newSession);
    setSelectedAnswer(null);

    // 最後の問題の場合は結果画面へ
    if (newSession.currentIndex >= newSession.questions.length) {
      setGameState('finished');
    } else {
      setGameState('playing');
    }
  };

  // リスタートハンドラ
  const handleRestart = () => {
    setSession(null);
    setSelectedAnswer(null);
    setGameState('selection');
  };

  // 終了ハンドラ
  const handleExit = () => {
    handleRestart();
  };

  // クイズ結果を計算
  const result = useMemo(() => {
    if (!session || gameState !== 'finished') return null;

    let correctCount = 0;
    const incorrectQuestionIds: string[] = [];

    session.questions.forEach((question) => {
      const userAnswer = session.answers.get(question.id);
      const correctAnswerId = question.choices.find(
        (c) => c.score === question.correctAnswer.score
      )?.id;

      if (userAnswer === correctAnswerId) {
        correctCount++;
      } else {
        incorrectQuestionIds.push(question.id);
      }
    });

    const result: ScoringQuizResult = {
      totalQuestions: session.questions.length,
      correctCount,
      accuracy: (correctCount / session.questions.length) * 100,
      incorrectQuestionIds: incorrectQuestionIds,
    };

    return result;
  }, [session, gameState]);

  // 難易度選択画面
  if (gameState === 'selection') {
    return <DifficultySelector onSelect={handleDifficultySelect} />;
  }

  // 結果画面
  if (gameState === 'finished' && result) {
    return (
      <ScoreBoard
        result={result}
        onRestart={handleRestart}
        onExit={handleExit}
      />
    );
  }

  // 問題がない場合
  if (!currentQuestion || !session) {
    return (
      <div className={styles.error}>
        問題の読み込みに失敗しました。
        <button onClick={handleRestart}>最初に戻る</button>
      </div>
    );
  }

  // 問題・フィードバック画面
  const correctAnswerId = currentQuestion.choices.find(
    (c) => c.score === currentQuestion.correctAnswer.score
  )?.id;
  const isCorrect = selectedAnswer === correctAnswerId;

  return (
    <div className={styles.container}>
      <ScoringQuestionDisplay
        question={currentQuestion}
        currentNumber={session.currentIndex + 1}
        totalQuestions={session.questions.length}
      />

      <div className={styles.choices}>
        {currentQuestion.choices.map((choice) => (
          <button
            key={choice.id}
            className={`${styles.choiceButton} ${
              selectedAnswer === choice.id ? styles.selected : ''
            } ${
              gameState === 'feedback'
                ? selectedAnswer === choice.id
                  ? isCorrect
                    ? styles.correct
                    : styles.incorrect
                  : ''
                : ''
            }`}
            onClick={() => handleChoiceSelect(choice.id)}
            disabled={gameState === 'feedback'}
          >
            <span className={styles.score}>{choice.score}点</span>
            <span className={styles.label}>{choice.label}</span>
          </button>
        ))}
      </div>

      {gameState === 'feedback' && (
        <div className={styles.feedbackContainer}>
          <ScoringFeedback
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            isCorrect={isCorrect}
          />

          <button className={styles.nextButton} onClick={handleNext}>
            {session.currentIndex + 1 >= session.questions.length
              ? '結果を見る'
              : '次の問題へ'}
          </button>
        </div>
      )}
    </div>
  );
}
