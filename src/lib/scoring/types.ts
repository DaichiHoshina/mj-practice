import { TileType } from '../tiles';

/** 役の定義 */
export interface Yaku {
  readonly id: string; // 一意識別子
  readonly name: string; // 日本語名
  readonly han: number; // 翻数（門前）
  readonly hanNaki: number; // 翻数（鳴き）
  readonly isYakuman: boolean; // 役満フラグ
}

/** 役判定結果 */
export interface YakuResult {
  readonly yakuList: readonly Yaku[];
  readonly totalHan: number;
  readonly isYakuman: boolean;
}

/** 符の内訳 */
export interface FuBreakdown {
  readonly base: 20; // 副底
  readonly mentsuFu: readonly MentsuFuItem[]; // 面子符
  readonly jantouFu: number; // 雀頭符
  readonly machiFu: number; // 待ち符
  readonly tsumoFu: number; // ツモ符
  readonly menzenRonFu: number; // 門前ロン符
  readonly rawTotal: number; // 切り上げ前合計
  readonly total: number; // 切り上げ後合計
}

/** 面子符の項目 */
export interface MentsuFuItem {
  readonly type: 'shuntsu' | 'koutsu' | 'kantsu';
  readonly tiles: readonly TileType[];
  readonly isAnkou: boolean; // 暗刻/暗槓
  readonly isYaochuuhai: boolean; // 么九牌
  readonly fu: number;
}

/** 点数計算結果 */
export interface ScoreResult {
  readonly fu: number;
  readonly han: number;
  readonly baseScore: number; // 基本点
  readonly score: number; // 最終点数
  readonly scoreType: ScoreType; // 満貫等
  readonly isDealer: boolean;
  readonly isTsumo: boolean;
  readonly payments: PaymentBreakdown;
}

/** 点数区分 */
export type ScoreType =
  | 'normal'
  | 'mangan'
  | 'haneman'
  | 'baiman'
  | 'sanbaiman'
  | 'kazoeYakuman'
  | 'yakuman';

/** 支払い内訳 */
export interface PaymentBreakdown {
  readonly total: number;
  readonly fromDealer?: number; // ツモ時の親支払い
  readonly fromNonDealer?: number; // ツモ時の子支払い
  readonly fromLoser?: number; // ロン時の放銃者支払い
}

/** 和了コンテキスト（役判定に必要な情報） */
export interface WinContext {
  readonly winningTile: TileType;
  readonly isTsumo: boolean;
  readonly isDealer: boolean;
  readonly isRiichi: boolean;
  readonly isDoubleRiichi?: boolean;
  readonly isIppatsu?: boolean;
  readonly isHaitei?: boolean;
  readonly isRinshan?: boolean;
  readonly roundWind: 'ton' | 'nan' | 'shaa' | 'pei';
  readonly seatWind: 'ton' | 'nan' | 'shaa' | 'pei';
  readonly dora: readonly TileType[];
  readonly uraDora?: readonly TileType[];
}

/** 点数計算問題 */
export interface ScoringQuestion {
  readonly id: string;
  readonly category: 'scoring';
  readonly difficulty: 'easy' | 'medium' | 'hard';
  readonly title: string;
  readonly hand: readonly TileType[];
  readonly winningTile: TileType;
  readonly isDealer: boolean;
  readonly isTsumo: boolean;
  readonly isRiichi: boolean;
  readonly dora: readonly TileType[];
  readonly situation: {
    readonly roundWind: 'ton' | 'nan' | 'shaa' | 'pei';
    readonly seatWind: 'ton' | 'nan' | 'shaa' | 'pei';
  };
  readonly correctAnswer: {
    readonly score: number;
    readonly yaku: readonly string[];
    readonly fu: number;
    readonly han: number;
  };
  readonly choices: readonly {
    readonly id: string;
    readonly label: string;
    readonly score: number;
  }[];
  readonly explanation: string;
}
