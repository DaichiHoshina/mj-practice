import { Question, QuizDifficulty } from './types';
import { ScoringQuestion } from '@/lib/scoring/types';
import easyQuestions from '@/data/questions/easy.json';
import easyPart2Questions from '@/data/questions/easy-part2.json';
import mediumPart1Questions from '@/data/questions/medium-part1.json';
import mediumPart2Questions from '@/data/questions/medium-part2.json';
import hardPart1Questions from '@/data/questions/hard-part1.json';
import hardPart2Questions from '@/data/questions/hard-part2.json';
import scoringEasyQuestions from '@/data/questions/scoring-easy.json';
import scoringSampleQuestions from '@/data/questions/scoring-sample.json';
import efficiencyEasyQuestions from '@/data/questions/efficiency-easy.json';
import efficiencyMediumQuestions from '@/data/questions/efficiency-medium.json';
import efficiencyHardQuestions from '@/data/questions/efficiency-hard.json';

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

/**
 * すべてのScoring問題をマージ
 */
const allScoringQuestions: ScoringQuestion[] = [
  ...scoringEasyQuestions,
  ...scoringSampleQuestions,
] as ScoringQuestion[];

/**
 * 指定された難易度のScoring問題を読み込み
 * @param difficulty - 問題の難易度
 * @param count - 問題数（デフォルト10問）
 * @returns シャッフルされた問題のリスト
 */
export function loadScoringQuestions(
  difficulty: QuizDifficulty,
  count = 10
): readonly ScoringQuestion[] {
  const filteredQuestions = allScoringQuestions.filter(
    (q) => q.difficulty === difficulty
  );

  if (filteredQuestions.length === 0) {
    throw new Error(`No scoring questions found for difficulty: ${difficulty}`);
  }

  const shuffled = shuffleArray(filteredQuestions);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * すべての難易度からScoring問題をミックスして読み込み
 * @param count - 問題数（デフォルト10問）
 * @returns シャッフルされた問題のリスト
 */
export function loadMixedScoringQuestions(
  count = 10
): readonly ScoringQuestion[] {
  const shuffled = shuffleArray(allScoringQuestions);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * すべてのEfficiency問題をマージ
 */
const allEfficiencyQuestions: Question[] = [
  ...efficiencyEasyQuestions,
  ...efficiencyMediumQuestions,
  ...efficiencyHardQuestions,
] as Question[];

/**
 * 指定された難易度のEfficiency問題を読み込み
 * @param difficulty - 問題の難易度
 * @param count - 問題数（デフォルト10問）
 * @returns シャッフルされた問題のリスト
 */
export function loadEfficiencyQuestions(
  difficulty: QuizDifficulty,
  count = 10
): readonly Question[] {
  const filteredQuestions = allEfficiencyQuestions.filter(
    (q) => q.difficulty === difficulty
  );

  if (filteredQuestions.length === 0) {
    throw new Error(
      `No efficiency questions found for difficulty: ${difficulty}`
    );
  }

  const shuffled = shuffleArray(filteredQuestions);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * すべての難易度からEfficiency問題をミックスして読み込み
 * @param count - 問題数（デフォルト10問）
 * @returns シャッフルされた問題のリスト
 */
export function loadMixedEfficiencyQuestions(count = 10): readonly Question[] {
  const shuffled = shuffleArray(allEfficiencyQuestions);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
