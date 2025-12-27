'use client';

import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import {
  QuizSession,
  QuizDifficulty,
  createQuizSession,
  calculateQuizResult,
} from '@/lib/quiz';
import { loadQuestions } from '@/lib/quiz/loader';
import { DifficultySelector } from './DifficultySelector';
import { QuestionDisplay } from './QuestionDisplay';
import { ChoiceButton } from './ChoiceButton';
import { ScoreBoard } from './ScoreBoard';
import styles from './QuizGame.module.css';

type GameState = 'selection' | 'playing' | 'feedback' | 'finished';

/**
 * クイズゲーム全体を管理するコンポーネント
 */
export function QuizGame() {
  const [gameState, setGameState] = useState<GameState>('selection');
  const [session, setSession] = useState<QuizSession | null>(null);
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
    const questions = loadQuestions(difficulty, 10);
    const newSession = createQuizSession(questions);
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

    const newSession: QuizSession = {
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
    return calculateQuizResult(session);
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
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className={styles.container}>
      <QuestionDisplay
        question={currentQuestion}
        currentNumber={session.currentIndex + 1}
        totalQuestions={session.questions.length}
      />

      <div className={styles.choices}>
        {currentQuestion.choices.map((choice) => (
          <ChoiceButton
            key={choice.id}
            choice={choice}
            onClick={handleChoiceSelect}
            selected={choice.id === selectedAnswer}
            isCorrect={
              gameState === 'feedback' && choice.id === selectedAnswer
                ? isCorrect
                : undefined
            }
            disabled={gameState === 'feedback'}
          />
        ))}
      </div>

      {gameState === 'feedback' && (
        <div className={styles.feedback}>
          <div
            className={`${styles.feedbackMessage} ${
              isCorrect ? styles.correct : styles.incorrect
            }`}
          >
            {isCorrect ? '正解！' : '不正解'}
          </div>

          <div className={styles.explanation}>
            <h3 className={styles.explanationTitle}>解説</h3>
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
              {currentQuestion.explanation}
            </ReactMarkdown>
          </div>

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
