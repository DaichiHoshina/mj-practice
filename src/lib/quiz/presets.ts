import { QuizPreset } from './types';

/**
 * クイズプリセット一覧
 */
export const QUIZ_PRESETS: readonly QuizPreset[] = [
  {
    id: 'easy-10',
    label: '初級 10問',
    difficulty: 'easy',
    questionCount: 10,
    description: '基本的な問題で麻雀の基礎を学ぶ',
    color: '#388e3c',
    emoji: '🟢',
  },
  {
    id: 'medium-10',
    label: '中級 10問',
    difficulty: 'medium',
    questionCount: 10,
    description: 'バランスの取れた標準的な練習',
    color: '#1976d2',
    emoji: '🔵',
  },
  {
    id: 'hard-10',
    label: '上級 10問',
    difficulty: 'hard',
    questionCount: 10,
    description: '難しい問題で実力を試す',
    color: '#d32f2f',
    emoji: '🔴',
  },
  {
    id: 'medium-20',
    label: '中級 20問',
    difficulty: 'medium',
    questionCount: 20,
    description: 'じっくり練習して定着させる',
    color: '#1976d2',
    emoji: '🔵',
  },
  {
    id: 'hard-20',
    label: '上級 20問',
    difficulty: 'hard',
    questionCount: 20,
    description: '徹底的に実力を強化する',
    color: '#d32f2f',
    emoji: '🔴',
  },
] as const;

/**
 * デフォルトプリセット（中級10問）
 */
export const DEFAULT_PRESET: QuizPreset = QUIZ_PRESETS[1];

/**
 * プリセットIDから設定を取得
 */
export function getPresetById(id: string): QuizPreset | undefined {
  return QUIZ_PRESETS.find((preset) => preset.id === id);
}
