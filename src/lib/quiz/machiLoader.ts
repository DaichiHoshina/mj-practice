import { MachiQuestion, QuizDifficulty } from './types';
import { TileType } from '../tiles';

/**
 * basePathを考慮したパスを取得
 */
function getBasePath(): string {
  return process.env.NODE_ENV === 'production' ? '/mj-practice' : '';
}

/**
 * 7枚待ちクイズデータをロード
 */
export async function loadMachiQuestions(
  difficulty?: QuizDifficulty
): Promise<MachiQuestion[]> {
  try {
    const basePath = getBasePath();
    const response = await fetch(`${basePath}/data/questions/machi-7.json`);
    if (!response.ok) {
      throw new Error(`Failed to load questions: ${response.status}`);
    }
    const data = await response.json();

    // データバリデーション
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error('Invalid question data format');
    }

    let questions: MachiQuestion[] = data.questions;

    // 難易度でフィルタリング
    if (difficulty) {
      questions = questions.filter((q) => q.difficulty === difficulty);
    }

    // Fisher-Yatesシャッフル
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    return questions;
  } catch (error) {
    console.error('Failed to load machi questions:', error);
    throw error;
  }
}

/**
 * 待ち牌候補を取得（萬子のみ）
 */
export function getMachiCandidates(): TileType[] {
  const candidates: TileType[] = [];

  // 型ガード関数
  function isManzuTile(value: string): value is TileType {
    return /^[1-9]m$/.test(value);
  }

  for (let i = 1; i <= 9; i++) {
    const tile = `${i}m`;
    if (isManzuTile(tile)) {
      candidates.push(tile);
    }
  }

  return candidates;
}

/**
 * 選択した待ち牌が正解かチェック（部分一致OK）
 */
export function checkMachiAnswer(
  selected: TileType[],
  correct: readonly TileType[]
): boolean {
  // correctから重複を除去して一意の待ち牌セットを作成
  const correctSet = new Set(correct);
  const selectedSet = new Set(selected);

  // 選択に重複がある場合は不正解
  if (selectedSet.size !== selected.length) {
    return false;
  }

  // 選択した牌が全て正解に含まれていればOK（部分一致を許可）
  return Array.from(selectedSet).every((tile) => correctSet.has(tile));
}
