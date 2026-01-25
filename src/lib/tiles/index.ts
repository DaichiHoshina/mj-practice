/**
 * 麻雀牌の種類と画像ファイルのマッピング
 */

/** 牌の種類を表すEnum */
export enum TileType {
  // 萬子 (Characters/Man)
  MAN1 = '1m',
  MAN2 = '2m',
  MAN3 = '3m',
  MAN4 = '4m',
  MAN5 = '5m',
  MAN6 = '6m',
  MAN7 = '7m',
  MAN8 = '8m',
  MAN9 = '9m',

  // 筒子 (Dots/Pin)
  PIN1 = '1p',
  PIN2 = '2p',
  PIN3 = '3p',
  PIN4 = '4p',
  PIN5 = '5p',
  PIN6 = '6p',
  PIN7 = '7p',
  PIN8 = '8p',
  PIN9 = '9p',

  // 索子 (Bamboo/Sou)
  SOU1 = '1s',
  SOU2 = '2s',
  SOU3 = '3s',
  SOU4 = '4s',
  SOU5 = '5s',
  SOU6 = '6s',
  SOU7 = '7s',
  SOU8 = '8s',
  SOU9 = '9s',

  // 字牌 (Honor tiles)
  TON = 'ton', // 東
  NAN = 'nan', // 南
  SHAA = 'shaa', // 西
  PEI = 'pei', // 北
  HAKU = 'haku', // 白
  HATSU = 'hatsu', // 發
  CHUN = 'chun', // 中

  // 赤ドラ (Red dora tiles)
  MAN5_DORA = '0m',
  PIN5_DORA = '0p',
  SOU5_DORA = '0s',

  // その他
  BACK = 'back', // 牌の裏面
  FRONT = 'front', // 牌の表面（枠のみ）
  BLANK = 'blank', // 空白牌
}

/** 牌タイプからSVGファイル名へのマッピング */
export const TILE_TO_FILENAME: Record<TileType, string> = {
  // 萬子
  [TileType.MAN1]: 'Man1.svg',
  [TileType.MAN2]: 'Man2.svg',
  [TileType.MAN3]: 'Man3.svg',
  [TileType.MAN4]: 'Man4.svg',
  [TileType.MAN5]: 'Man5.svg',
  [TileType.MAN6]: 'Man6.svg',
  [TileType.MAN7]: 'Man7.svg',
  [TileType.MAN8]: 'Man8.svg',
  [TileType.MAN9]: 'Man9.svg',

  // 筒子
  [TileType.PIN1]: 'Pin1.svg',
  [TileType.PIN2]: 'Pin2.svg',
  [TileType.PIN3]: 'Pin3.svg',
  [TileType.PIN4]: 'Pin4.svg',
  [TileType.PIN5]: 'Pin5.svg',
  [TileType.PIN6]: 'Pin6.svg',
  [TileType.PIN7]: 'Pin7.svg',
  [TileType.PIN8]: 'Pin8.svg',
  [TileType.PIN9]: 'Pin9.svg',

  // 索子
  [TileType.SOU1]: 'Sou1.svg',
  [TileType.SOU2]: 'Sou2.svg',
  [TileType.SOU3]: 'Sou3.svg',
  [TileType.SOU4]: 'Sou4.svg',
  [TileType.SOU5]: 'Sou5.svg',
  [TileType.SOU6]: 'Sou6.svg',
  [TileType.SOU7]: 'Sou7.svg',
  [TileType.SOU8]: 'Sou8.svg',
  [TileType.SOU9]: 'Sou9.svg',

  // 字牌
  [TileType.TON]: 'Ton.svg',
  [TileType.NAN]: 'Nan.svg',
  [TileType.SHAA]: 'Shaa.svg',
  [TileType.PEI]: 'Pei.svg',
  [TileType.HAKU]: 'Haku.svg',
  [TileType.HATSU]: 'Hatsu.svg',
  [TileType.CHUN]: 'Chun.svg',

  // 赤ドラ
  [TileType.MAN5_DORA]: 'Man5-Dora.svg',
  [TileType.PIN5_DORA]: 'Pin5-Dora.svg',
  [TileType.SOU5_DORA]: 'Sou5-Dora.svg',

  // その他
  [TileType.BACK]: 'Back.svg',
  [TileType.FRONT]: 'Front.svg',
  [TileType.BLANK]: 'Blank.svg',
};

/**
 * 牌タイプからSVGファイルのパスを取得
 * @param tile 牌タイプ
 * @returns SVGファイルのパス (例: /tiles/Man1.svg)
 */
/**
 * 牌タイプからSVGファイルのパスを取得
 * @param tile 牌タイプ
 * @returns SVGファイルのパス (例: /tiles/Man1.svg)
 */
export function getTilePath(tile: TileType): string {
  const filename = TILE_TO_FILENAME[tile];
  const basePath = process.env.NODE_ENV === 'production' ? '/mj-practice' : '';
  return `${basePath}/tiles/${filename}`;
}

/**
 * すべての数牌（萬子・筒子・索子）を取得
 */
export const NUMBER_TILES: TileType[] = [
  // 萬子
  TileType.MAN1,
  TileType.MAN2,
  TileType.MAN3,
  TileType.MAN4,
  TileType.MAN5,
  TileType.MAN6,
  TileType.MAN7,
  TileType.MAN8,
  TileType.MAN9,
  // 筒子
  TileType.PIN1,
  TileType.PIN2,
  TileType.PIN3,
  TileType.PIN4,
  TileType.PIN5,
  TileType.PIN6,
  TileType.PIN7,
  TileType.PIN8,
  TileType.PIN9,
  // 索子
  TileType.SOU1,
  TileType.SOU2,
  TileType.SOU3,
  TileType.SOU4,
  TileType.SOU5,
  TileType.SOU6,
  TileType.SOU7,
  TileType.SOU8,
  TileType.SOU9,
];

/**
 * すべての字牌を取得
 */
export const HONOR_TILES: TileType[] = [
  TileType.TON,
  TileType.NAN,
  TileType.SHAA,
  TileType.PEI,
  TileType.HAKU,
  TileType.HATSU,
  TileType.CHUN,
];

/**
 * すべての赤ドラ牌を取得
 */
export const DORA_TILES: TileType[] = [
  TileType.MAN5_DORA,
  TileType.PIN5_DORA,
  TileType.SOU5_DORA,
];

/**
 * すべての牌（ゲーム用の牌のみ、BACKやFRONTは除外）を取得
 */
export const ALL_GAME_TILES: TileType[] = [...NUMBER_TILES, ...HONOR_TILES];
