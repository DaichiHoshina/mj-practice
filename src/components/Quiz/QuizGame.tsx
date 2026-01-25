'use client';

import { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import {
  QuizSession,
  QuizCategory,
  QuizPreset,
  createQuizSession,
  calculateQuizResult,
} from '@/lib/quiz';
import { loadQuestions, loadEfficiencyQuestions } from '@/lib/quiz/loader';
import { DEFAULT_PRESET } from '@/lib/quiz/presets';
import { PresetSelector } from './PresetSelector';
import { QuestionDisplay } from './QuestionDisplay';
import { ChoiceButton } from './ChoiceButton';
import { ScoreBoard } from './ScoreBoard';
import styles from './QuizGame.module.css';

type GameState = 'playing' | 'feedback' | 'finished' | 'settings';

interface QuizGameProps {
  readonly category?: QuizCategory;
}

/**
 * クイズゲーム全体を管理するコンポーネント
 */
export function QuizGame({ category = 'shanten' }: QuizGameProps) {
  const [gameState, setGameState] = useState<GameState>('playing');
  const [session, setSession] = useState<QuizSession | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentPreset, setCurrentPreset] =
    useState<QuizPreset>(DEFAULT_PRESET);

  // 初回レンダリング時にデフォルト設定でセッション作成
  useEffect(() => {
    if (!session) {
      const questions =
        category === 'effective'
          ? loadEfficiencyQuestions(
              DEFAULT_PRESET.difficulty,
              DEFAULT_PRESET.questionCount
            )
          : loadQuestions(
              DEFAULT_PRESET.difficulty,
              DEFAULT_PRESET.questionCount
            );
      const newSession = createQuizSession(questions);
      setSession(newSession);
    }
  }, []);

  // 現在の問題を取得
  const currentQuestion = useMemo(() => {
    if (!session || session.currentIndex >= session.questions.length) {
      return null;
    }
    return session.questions[session.currentIndex];
  }, [session]);

  // プリセット設定でクイズ開始
  const startQuizWithPreset = (preset: QuizPreset) => {
    const questions =
      category === 'effective'
        ? loadEfficiencyQuestions(preset.difficulty, preset.questionCount)
        : loadQuestions(preset.difficulty, preset.questionCount);
    const newSession = createQuizSession(questions);
    setSession(newSession);
    setCurrentPreset(preset);
    setGameState('playing');
  };

  // 設定変更ハンドラ
  const handleOpenSettings = () => {
    setGameState('settings');
  };

  // プリセット選択ハンドラ
  const handlePresetSelect = (preset: QuizPreset) => {
    startQuizWithPreset(preset);
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

  // リスタートハンドラ（現在のプリセットで再開始）
  const handleRestart = () => {
    setSelectedAnswer(null);
    startQuizWithPreset(currentPreset);
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

  // 設定変更画面
  if (gameState === 'settings') {
    return (
      <PresetSelector
        onSelect={handlePresetSelect}
        onClose={() => setGameState('playing')}
      />
    );
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
      <div className={styles.header}>
        <div className={styles.currentPreset}>
          {currentPreset.emoji} {currentPreset.label}
        </div>
        <button className={styles.settingsButton} onClick={handleOpenSettings}>
          ⚙️ 設定変更
        </button>
      </div>

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
            isCorrectAnswer={
              gameState === 'feedback' &&
              !isCorrect &&
              choice.id === currentQuestion.correctAnswer
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
