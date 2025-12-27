import { ScoreResult, ScoreType, PaymentBreakdown } from './types';
import { MANGAN_SCORES } from './constants';

/**
 * 点数を100点単位で切り上げ
 */
function roundUp100(score: number): number {
  return Math.ceil(score / 100) * 100;
}

/**
 * スコアタイプを判定
 */
function determineScoreType(han: number): ScoreType {
  if (han >= 13) return 'kazoeYakuman';
  if (han >= 11) return 'sanbaiman';
  if (han >= 8) return 'baiman';
  if (han >= 6) return 'haneman';
  if (han >= 5) return 'mangan';
  return 'normal';
}

/**
 * 支払い内訳を計算
 */
function calculatePayments(
  score: number,
  isDealer: boolean,
  isTsumo: boolean
): PaymentBreakdown {
  if (isTsumo) {
    if (isDealer) {
      // 親ツモ：全員が各 score / 3（100点単位切り上げ）
      const each = roundUp100(score / 3);
      return {
        total: score,
        fromNonDealer: each,
      };
    } else {
      // 子ツモ：親が score / 2（100点単位切り上げ）、子が score / 4（100点単位切り上げ）
      const fromDealer = roundUp100(score / 2);
      const fromNonDealer = roundUp100(score / 4);
      return {
        total: score,
        fromDealer,
        fromNonDealer,
      };
    }
  } else {
    // ロン：放銃者が全額負担
    return {
      total: score,
      fromLoser: score,
    };
  }
}

/**
 * 基本点から最終スコアを計算（満貫未満）
 */
function calculateNormalScore(
  baseScore: number,
  isDealer: boolean,
  isTsumo: boolean
): number {
  if (isTsumo) {
    if (isDealer) {
      // 親ツモ：各子から基本点 × 2（100点単位切り上げ）
      const eachPayment = roundUp100(baseScore * 2);
      return eachPayment * 3;
    } else {
      // 子ツモ：親支払い（基本点 × 2）、子支払い（基本点）
      const fromDealer = roundUp100(baseScore * 2);
      const fromNonDealer = roundUp100(baseScore);
      return fromDealer + fromNonDealer * 2;
    }
  } else {
    if (isDealer) {
      // 親ロン：基本点 × 6
      return roundUp100(baseScore * 6);
    } else {
      // 子ロン：基本点 × 4
      return roundUp100(baseScore * 4);
    }
  }
}

/**
 * 満貫以上の点数を取得
 */
function getManganScore(
  scoreType: ScoreType,
  isDealer: boolean,
  isTsumo: boolean
): number {
  // ScoreType を MANGAN_SCORES のキーにマッピング
  const scoreTypeMap: Record<ScoreType, keyof typeof MANGAN_SCORES> = {
    normal: 'MANGAN', // normalの場合は呼ばれない
    mangan: 'MANGAN',
    haneman: 'HANEMAN',
    baiman: 'BAIMAN',
    sanbaiman: 'SANBAIMAN',
    kazoeYakuman: 'KAZOE_YAKUMAN',
    yakuman: 'YAKUMAN',
  };

  const key = scoreTypeMap[scoreType];
  const scores = MANGAN_SCORES[key];

  if (!scores) {
    throw new Error(`Invalid score type: ${scoreType}`);
  }

  if (isTsumo) {
    if (isDealer) {
      return scores.DEALER_TSUMO.total;
    } else {
      return scores.NON_DEALER_TSUMO.total;
    }
  } else {
    if (isDealer) {
      return scores.DEALER_RON;
    } else {
      return scores.NON_DEALER_RON;
    }
  }
}

/**
 * 点数を計算
 * @param fu - 符（20以上で10の倍数）
 * @param han - 翻数（1以上）
 * @param isDealer - 親か
 * @param isTsumo - ツモか
 * @returns 点数計算結果
 */
export function calculateScore(
  fu: number,
  han: number,
  isDealer: boolean,
  isTsumo: boolean
): ScoreResult {
  // 基本点計算: 符 × 2^(翻+2)
  const baseScore = fu * Math.pow(2, han + 2);

  // スコアタイプ判定
  const scoreType = determineScoreType(han);

  // 最終スコア計算
  let score: number;
  if (scoreType === 'normal') {
    score = calculateNormalScore(baseScore, isDealer, isTsumo);
  } else {
    score = getManganScore(scoreType, isDealer, isTsumo);
  }

  // 支払い内訳計算
  const payments = calculatePayments(score, isDealer, isTsumo);

  return {
    fu,
    han,
    baseScore,
    score,
    scoreType,
    isDealer,
    isTsumo,
    payments,
  };
}
