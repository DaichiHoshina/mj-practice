import { Question, QuizDifficulty } from './types';
import easyQuestions from '@/data/questions/easy.json';
import easyPart2Questions from '@/data/questions/easy-part2.json';
import mediumPart1Questions from '@/data/questions/medium-part1.json';
import mediumPart2Questions from '@/data/questions/medium-part2.json';
import hardPart1Questions from '@/data/questions/hard-part1.json';
import hardPart2Questions from '@/data/questions/hard-part2.json';

/**
 * すべての問題をマージ
 */
const allQuestions: Question[] = [
  ...easyQuestions,
  ...easyPart2Questions,
  ...mediumPart1Questions,
  ...mediumPart2Questions,
  ...hardPart1Questions,
  ...hardPart2Questions,
] as Question[];

/**
 * 配列をランダムにシャッフル（Fisher-Yates法）
 */
function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 指定された難易度の問題を読み込み
 * @param difficulty - 問題の難易度
 * @param count - 問題数（デフォルト10問）
 * @returns シャッフルされた問題のリスト
 */
export function loadQuestions(
  difficulty: QuizDifficulty,
  count = 10
): readonly Question[] {
  const filteredQuestions = allQuestions.filter(
    (q) => q.difficulty === difficulty
  );

  if (filteredQuestions.length === 0) {
    throw new Error(`No questions found for difficulty: ${difficulty}`);
  }

  const shuffled = shuffleArray(filteredQuestions);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * すべての難易度から問題をミックスして読み込み
 * @param count - 問題数（デフォルト10問）
 * @returns シャッフルされた問題のリスト
 */
export function loadMixedQuestions(count = 10): readonly Question[] {
  const shuffled = shuffleArray(allQuestions);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * 利用可能な問題数を取得
 * @param difficulty - 問題の難易度（指定しない場合は全問題）
 * @returns 問題数
 */
export function getQuestionCount(difficulty?: QuizDifficulty): number {
  if (!difficulty) {
    return allQuestions.length;
  }
  return allQuestions.filter((q) => q.difficulty === difficulty).length;
}
