import { Yaku } from './types';

/**
 * 役定義テーブル（25種類）
 */
export const YAKU_DEFINITIONS: readonly Yaku[] = [
  // 1翻役
  {
    id: 'riichi',
    name: 'リーチ',
    han: 1,
    hanNaki: 0,
    isYakuman: false,
  },
  {
    id: 'tanyao',
    name: 'タンヤオ',
    han: 1,
    hanNaki: 1,
    isYakuman: false,
  },
  {
    id: 'pinfu',
    name: '平和',
    han: 1,
    hanNaki: 0,
    isYakuman: false,
  },
  {
    id: 'iipeikou',
    name: '一盃口',
    han: 1,
    hanNaki: 0,
    isYakuman: false,
  },
  {
    id: 'yakuhai_ton',
    name: '役牌 東',
    han: 1,
    hanNaki: 1,
    isYakuman: false,
  },
  {
    id: 'yakuhai_nan',
    name: '役牌 南',
    han: 1,
    hanNaki: 1,
    isYakuman: false,
  },
  {
    id: 'yakuhai_shaa',
    name: '役牌 西',
    han: 1,
    hanNaki: 1,
    isYakuman: false,
  },
  {
    id: 'yakuhai_pei',
    name: '役牌 北',
    han: 1,
    hanNaki: 1,
    isYakuman: false,
  },
  {
    id: 'yakuhai_haku',
    name: '役牌 白',
    han: 1,
    hanNaki: 1,
    isYakuman: false,
  },
  {
    id: 'yakuhai_hatsu',
    name: '役牌 發',
    han: 1,
    hanNaki: 1,
    isYakuman: false,
  },
  {
    id: 'yakuhai_chun',
    name: '役牌 中',
    han: 1,
    hanNaki: 1,
    isYakuman: false,
  },

  // 2翻役
  {
    id: 'sanshoku_doujun',
    name: '三色同順',
    han: 2,
    hanNaki: 1,
    isYakuman: false,
  },
  {
    id: 'ikkitsuukan',
    name: '一気通貫',
    han: 2,
    hanNaki: 1,
    isYakuman: false,
  },
  {
    id: 'chanta',
    name: 'チャンタ',
    han: 2,
    hanNaki: 1,
    isYakuman: false,
  },
  {
    id: 'toitoi',
    name: '対々和',
    han: 2,
    hanNaki: 2,
    isYakuman: false,
  },
  {
    id: 'sanankou',
    name: '三暗刻',
    han: 2,
    hanNaki: 2,
    isYakuman: false,
  },
  {
    id: 'sanshoku_doukou',
    name: '三色同刻',
    han: 2,
    hanNaki: 2,
    isYakuman: false,
  },
  {
    id: 'chiitoitsu',
    name: '七対子',
    han: 2,
    hanNaki: 0,
    isYakuman: false,
  },

  // 3翻役
  {
    id: 'honitsu',
    name: '混一色',
    han: 3,
    hanNaki: 2,
    isYakuman: false,
  },
  {
    id: 'junchan',
    name: '純全帯',
    han: 3,
    hanNaki: 2,
    isYakuman: false,
  },

  // 役満
  {
    id: 'sankantsu',
    name: '三槓子',
    han: 0,
    hanNaki: 0,
    isYakuman: true,
  },
  {
    id: 'honroutou',
    name: '混老頭',
    han: 0,
    hanNaki: 0,
    isYakuman: true,
  },
  {
    id: 'shousangen',
    name: '小三元',
    han: 0,
    hanNaki: 0,
    isYakuman: true,
  },
  {
    id: 'daisangen',
    name: '大三元',
    han: 0,
    hanNaki: 0,
    isYakuman: true,
  },
  {
    id: 'suuankou',
    name: '四暗刻',
    han: 0,
    hanNaki: 0,
    isYakuman: true,
  },
  {
    id: 'kokushimusou',
    name: '国士無双',
    han: 0,
    hanNaki: 0,
    isYakuman: true,
  },

  // 6翻役（清一色）
  {
    id: 'chinitsu',
    name: '清一色',
    han: 6,
    hanNaki: 5,
    isYakuman: false,
  },
] as const;

/**
 * 符計算定数テーブル
 */
export const FU_TABLE = {
  /** 副底 */
  BASE: 20,

  /** 面子符 */
  MENTSU: {
    /** 順子 */
    SHUNTSU: 0,
    /** 中張刻子（明刻） */
    CHUNCHAN_MINKOU: 2,
    /** 中張刻子（暗刻） */
    CHUNCHAN_ANKOU: 4,
    /** 么九刻子（明刻） */
    YAOCHUU_MINKOU: 4,
    /** 么九刻子（暗刻） */
    YAOCHUU_ANKOU: 8,
    /** 中張槓子（明槓） */
    CHUNCHAN_MINKAN: 8,
    /** 中張槓子（暗槓） */
    CHUNCHAN_ANKAN: 16,
    /** 么九槓子（明槓） */
    YAOCHUU_MINKAN: 16,
    /** 么九槓子（暗槓） */
    YAOCHUU_ANKAN: 32,
  },

  /** 雀頭符（役牌の場合） */
  JANTOU: 2,

  /** 待ち符（辺張・嵌張・単騎） */
  MACHI: 2,

  /** ツモ符 */
  TSUMO: 2,

  /** 門前ロン符 */
  MENZEN_RON: 10,

  /** 符の切り上げ単位 */
  ROUND_UP_UNIT: 10,
} as const;

/**
 * 満貫以上の点数定数
 */
export const MANGAN_SCORES = {
  /** 満貫（5翻） */
  MANGAN: {
    /** 親ツモ */
    DEALER_TSUMO: { total: 12000, each: 4000 },
    /** 親ロン */
    DEALER_RON: 12000,
    /** 子ツモ */
    NON_DEALER_TSUMO: { total: 8000, dealer: 4000, nonDealer: 2000 },
    /** 子ロン */
    NON_DEALER_RON: 8000,
  },

  /** 跳満（6-7翻） */
  HANEMAN: {
    /** 親ツモ */
    DEALER_TSUMO: { total: 18000, each: 6000 },
    /** 親ロン */
    DEALER_RON: 18000,
    /** 子ツモ */
    NON_DEALER_TSUMO: { total: 12000, dealer: 6000, nonDealer: 3000 },
    /** 子ロン */
    NON_DEALER_RON: 12000,
  },

  /** 倍満（8-10翻） */
  BAIMAN: {
    /** 親ツモ */
    DEALER_TSUMO: { total: 24000, each: 8000 },
    /** 親ロン */
    DEALER_RON: 24000,
    /** 子ツモ */
    NON_DEALER_TSUMO: { total: 16000, dealer: 8000, nonDealer: 4000 },
    /** 子ロン */
    NON_DEALER_RON: 16000,
  },

  /** 三倍満（11-12翻） */
  SANBAIMAN: {
    /** 親ツモ */
    DEALER_TSUMO: { total: 36000, each: 12000 },
    /** 親ロン */
    DEALER_RON: 36000,
    /** 子ツモ */
    NON_DEALER_TSUMO: { total: 24000, dealer: 12000, nonDealer: 6000 },
    /** 子ロン */
    NON_DEALER_RON: 24000,
  },

  /** 数え役満（13翻以上） */
  KAZOE_YAKUMAN: {
    /** 親ツモ */
    DEALER_TSUMO: { total: 48000, each: 16000 },
    /** 親ロン */
    DEALER_RON: 48000,
    /** 子ツモ */
    NON_DEALER_TSUMO: { total: 32000, dealer: 16000, nonDealer: 8000 },
    /** 子ロン */
    NON_DEALER_RON: 32000,
  },

  /** 役満 */
  YAKUMAN: {
    /** 親ツモ */
    DEALER_TSUMO: { total: 48000, each: 16000 },
    /** 親ロン */
    DEALER_RON: 48000,
    /** 子ツモ */
    NON_DEALER_TSUMO: { total: 32000, dealer: 16000, nonDealer: 8000 },
    /** 子ロン */
    NON_DEALER_RON: 32000,
  },
} as const;
