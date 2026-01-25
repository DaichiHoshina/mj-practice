import { TileType } from '../tiles';

/**
 * クイズのカテゴリ
 */
export type QuizCategory = 'shanten' | 'effective' | 'wait' | 'scoring';

/**
 * クイズの難易度
 */
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

/**
 * クイズの選択肢
 */
export interface Choice {
  readonly id: string;
  readonly label: string;
  readonly tile?: TileType;
}

/**
 * クイズ問題
 */
export interface Question {
  readonly id: string;
  readonly category: QuizCategory;
  readonly difficulty: QuizDifficulty;
  readonly title: string;
  readonly hand: readonly TileType[];
  readonly correctAnswer: string;
  readonly choices: readonly Choice[];
  readonly explanation: string;
}

/**
 * 待ち当てクイズ問題（7枚待ちなど）
 */
export interface MachiQuestion {
  readonly id: string;
  readonly hand: readonly TileType[];
  readonly correctAnswers: readonly TileType[];
  readonly difficulty: QuizDifficulty;
  readonly pattern: string;
  readonly explanation: string;
}

/**
 * クイズセッション
 */
export interface QuizSession {
  readonly questions: readonly Question[];
  currentIndex: number;
  readonly answers: ReadonlyMap<string, string>;
  readonly startTime: Date;
}

/**
 * クイズ結果
 */
export interface QuizResult {
  readonly totalQuestions: number;
  readonly correctCount: number;
  readonly accuracy: number;
  readonly incorrectQuestionIds: readonly string[];
}
