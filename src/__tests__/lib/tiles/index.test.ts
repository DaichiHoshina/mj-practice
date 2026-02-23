/**
 * tiles/index.ts のテスト
 * 麻雀牌の種類定義、ファイルマッピング、パス取得関数を検証
 */

import {
  TileType,
  getTilePath,
  TILE_TO_FILENAME,
  NUMBER_TILES,
  HONOR_TILES,
  DORA_TILES,
  ALL_GAME_TILES,
} from '@/lib/tiles';

describe('TileType enum', () => {
  describe('数牌', () => {
    it('萬子が9種定義されている', () => {
      // Arrange
      const manTiles = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
      ];

      // Assert
      expect(manTiles).toHaveLength(9);
      expect(manTiles).toEqual([
        '1m',
        '2m',
        '3m',
        '4m',
        '5m',
        '6m',
        '7m',
        '8m',
        '9m',
      ]);
    });

    it('筒子が9種定義されている', () => {
      // Arrange
      const pinTiles = [
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN3,
        TileType.PIN4,
        TileType.PIN5,
        TileType.PIN6,
        TileType.PIN7,
        TileType.PIN8,
        TileType.PIN9,
      ];

      // Assert
      expect(pinTiles).toHaveLength(9);
      expect(pinTiles).toEqual([
        '1p',
        '2p',
        '3p',
        '4p',
        '5p',
        '6p',
        '7p',
        '8p',
        '9p',
      ]);
    });

    it('索子が9種定義されている', () => {
      // Arrange
      const souTiles = [
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

      // Assert
      expect(souTiles).toHaveLength(9);
      expect(souTiles).toEqual([
        '1s',
        '2s',
        '3s',
        '4s',
        '5s',
        '6s',
        '7s',
        '8s',
        '9s',
      ]);
    });
  });

  describe('字牌', () => {
    it('風牌4種が定義されている', () => {
      // Assert
      expect(TileType.TON).toBe('ton');
      expect(TileType.NAN).toBe('nan');
      expect(TileType.SHAA).toBe('shaa');
      expect(TileType.PEI).toBe('pei');
    });

    it('三元牌3種が定義されている', () => {
      // Assert
      expect(TileType.HAKU).toBe('haku');
      expect(TileType.HATSU).toBe('hatsu');
      expect(TileType.CHUN).toBe('chun');
    });
  });

  describe('赤ドラ', () => {
    it('赤ドラ3種が定義されている', () => {
      // Assert
      expect(TileType.MAN5_DORA).toBe('0m');
      expect(TileType.PIN5_DORA).toBe('0p');
      expect(TileType.SOU5_DORA).toBe('0s');
    });
  });

  describe('特殊牌', () => {
    it('裏面・表面・空白の3種が定義されている', () => {
      // Assert
      expect(TileType.BACK).toBe('back');
      expect(TileType.FRONT).toBe('front');
      expect(TileType.BLANK).toBe('blank');
    });
  });

  it('合計40種のTileTypeが存在する（数牌27 + 字牌7 + 赤ドラ3 + 特殊3）', () => {
    // Arrange
    const allValues = Object.values(TileType);

    // Assert
    expect(allValues).toHaveLength(40);
  });
});

describe('TILE_TO_FILENAME', () => {
  it('全TileTypeに対してファイル名が定義されている', () => {
    // Arrange
    const allTileTypes = Object.values(TileType);

    // Act & Assert
    for (const tile of allTileTypes) {
      expect(TILE_TO_FILENAME[tile]).toBeDefined();
    }
  });

  it('全ファイル名が.svgで終わる', () => {
    // Arrange
    const allFilenames = Object.values(TILE_TO_FILENAME);

    // Act & Assert
    for (const filename of allFilenames) {
      expect(filename).toMatch(/\.svg$/);
    }
  });

  it('ファイル名が空文字でない', () => {
    // Arrange
    const allFilenames = Object.values(TILE_TO_FILENAME);

    // Act & Assert
    for (const filename of allFilenames) {
      expect(filename.length).toBeGreaterThan(4); // 最低 "X.svg"
    }
  });

  it('ファイル名が一意である', () => {
    // Arrange
    const allFilenames = Object.values(TILE_TO_FILENAME);
    const uniqueFilenames = new Set(allFilenames);

    // Assert
    expect(uniqueFilenames.size).toBe(allFilenames.length);
  });

  it('代表的な牌のファイル名が正しい', () => {
    // Assert
    expect(TILE_TO_FILENAME[TileType.MAN1]).toBe('Man1.svg');
    expect(TILE_TO_FILENAME[TileType.PIN5]).toBe('Pin5.svg');
    expect(TILE_TO_FILENAME[TileType.SOU9]).toBe('Sou9.svg');
    expect(TILE_TO_FILENAME[TileType.TON]).toBe('Ton.svg');
    expect(TILE_TO_FILENAME[TileType.CHUN]).toBe('Chun.svg');
    expect(TILE_TO_FILENAME[TileType.MAN5_DORA]).toBe('Man5-Dora.svg');
    expect(TILE_TO_FILENAME[TileType.BACK]).toBe('Back.svg');
  });
});

describe('getTilePath', () => {
  const originalEnv = process.env.NODE_ENV;

  const setNodeEnv = (value: string) => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value,
      writable: true,
      configurable: true,
    });
  };

  afterEach(() => {
    setNodeEnv(originalEnv ?? 'test');
  });

  describe('通常牌（開発環境）', () => {
    beforeEach(() => {
      setNodeEnv('test');
    });

    it('萬子の牌パスを正しく返す', () => {
      // Act
      const path = getTilePath(TileType.MAN1);

      // Assert
      expect(path).toBe('/tiles/Man1.svg');
    });

    it('筒子の牌パスを正しく返す', () => {
      // Act
      const path = getTilePath(TileType.PIN5);

      // Assert
      expect(path).toBe('/tiles/Pin5.svg');
    });

    it('索子の牌パスを正しく返す', () => {
      // Act
      const path = getTilePath(TileType.SOU9);

      // Assert
      expect(path).toBe('/tiles/Sou9.svg');
    });
  });

  describe('字牌のz表記変換', () => {
    beforeEach(() => {
      setNodeEnv('test');
    });

    it('1z（東）を正しく変換する', () => {
      // Act
      const path = getTilePath('1z' as TileType);

      // Assert
      expect(path).toBe('/tiles/Ton.svg');
    });

    it('2z（南）を正しく変換する', () => {
      // Act
      const path = getTilePath('2z' as TileType);

      // Assert
      expect(path).toBe('/tiles/Nan.svg');
    });

    it('3z（西）を正しく変換する', () => {
      // Act
      const path = getTilePath('3z' as TileType);

      // Assert
      expect(path).toBe('/tiles/Shaa.svg');
    });

    it('4z（北）を正しく変換する', () => {
      // Act
      const path = getTilePath('4z' as TileType);

      // Assert
      expect(path).toBe('/tiles/Pei.svg');
    });

    it('5z（白）を正しく変換する', () => {
      // Act
      const path = getTilePath('5z' as TileType);

      // Assert
      expect(path).toBe('/tiles/Haku.svg');
    });

    it('6z（發）を正しく変換する', () => {
      // Act
      const path = getTilePath('6z' as TileType);

      // Assert
      expect(path).toBe('/tiles/Hatsu.svg');
    });

    it('7z（中）を正しく変換する', () => {
      // Act
      const path = getTilePath('7z' as TileType);

      // Assert
      expect(path).toBe('/tiles/Chun.svg');
    });
  });

  describe('赤ドラ', () => {
    beforeEach(() => {
      setNodeEnv('test');
    });

    it('赤五萬のパスを正しく返す', () => {
      // Act
      const path = getTilePath(TileType.MAN5_DORA);

      // Assert
      expect(path).toBe('/tiles/Man5-Dora.svg');
    });

    it('赤五筒のパスを正しく返す', () => {
      // Act
      const path = getTilePath(TileType.PIN5_DORA);

      // Assert
      expect(path).toBe('/tiles/Pin5-Dora.svg');
    });

    it('赤五索のパスを正しく返す', () => {
      // Act
      const path = getTilePath(TileType.SOU5_DORA);

      // Assert
      expect(path).toBe('/tiles/Sou5-Dora.svg');
    });
  });

  describe('特殊牌', () => {
    beforeEach(() => {
      setNodeEnv('test');
    });

    it('裏面のパスを正しく返す', () => {
      // Act
      const path = getTilePath(TileType.BACK);

      // Assert
      expect(path).toBe('/tiles/Back.svg');
    });

    it('表面のパスを正しく返す', () => {
      // Act
      const path = getTilePath(TileType.FRONT);

      // Assert
      expect(path).toBe('/tiles/Front.svg');
    });

    it('空白のパスを正しく返す', () => {
      // Act
      const path = getTilePath(TileType.BLANK);

      // Assert
      expect(path).toBe('/tiles/Blank.svg');
    });
  });

  describe('production環境', () => {
    it('production環境ではbasePathに/mj-practiceが付く', () => {
      // Arrange
      setNodeEnv('production');

      // Act
      const path = getTilePath(TileType.MAN1);

      // Assert
      expect(path).toBe('/mj-practice/tiles/Man1.svg');
    });

    it('production環境でz表記でもbasePathが付く', () => {
      // Arrange
      setNodeEnv('production');

      // Act
      const path = getTilePath('1z' as TileType);

      // Assert
      expect(path).toBe('/mj-practice/tiles/Ton.svg');
    });

    it('production環境で赤ドラでもbasePathが付く', () => {
      // Arrange
      setNodeEnv('production');

      // Act
      const path = getTilePath(TileType.PIN5_DORA);

      // Assert
      expect(path).toBe('/mj-practice/tiles/Pin5-Dora.svg');
    });
  });

  describe('字牌の直接指定', () => {
    beforeEach(() => {
      setNodeEnv('test');
    });

    it('TileType.TONで直接指定しても正しく返す', () => {
      // Act
      const path = getTilePath(TileType.TON);

      // Assert
      expect(path).toBe('/tiles/Ton.svg');
    });

    it('TileType.HAKUで直接指定しても正しく返す', () => {
      // Act
      const path = getTilePath(TileType.HAKU);

      // Assert
      expect(path).toBe('/tiles/Haku.svg');
    });
  });
});

describe('牌グループ定数', () => {
  describe('NUMBER_TILES', () => {
    it('数牌は27種である', () => {
      // Assert
      expect(NUMBER_TILES).toHaveLength(27);
    });

    it('萬子9種が含まれている', () => {
      // Arrange
      const manTiles = [
        TileType.MAN1,
        TileType.MAN2,
        TileType.MAN3,
        TileType.MAN4,
        TileType.MAN5,
        TileType.MAN6,
        TileType.MAN7,
        TileType.MAN8,
        TileType.MAN9,
      ];

      // Assert
      for (const tile of manTiles) {
        expect(NUMBER_TILES).toContain(tile);
      }
    });

    it('筒子9種が含まれている', () => {
      // Arrange
      const pinTiles = [
        TileType.PIN1,
        TileType.PIN2,
        TileType.PIN3,
        TileType.PIN4,
        TileType.PIN5,
        TileType.PIN6,
        TileType.PIN7,
        TileType.PIN8,
        TileType.PIN9,
      ];

      // Assert
      for (const tile of pinTiles) {
        expect(NUMBER_TILES).toContain(tile);
      }
    });

    it('索子9種が含まれている', () => {
      // Arrange
      const souTiles = [
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

      // Assert
      for (const tile of souTiles) {
        expect(NUMBER_TILES).toContain(tile);
      }
    });

    it('字牌が含まれていない', () => {
      // Assert
      for (const tile of HONOR_TILES) {
        expect(NUMBER_TILES).not.toContain(tile);
      }
    });

    it('赤ドラが含まれていない', () => {
      // Assert
      for (const tile of DORA_TILES) {
        expect(NUMBER_TILES).not.toContain(tile);
      }
    });
  });

  describe('HONOR_TILES', () => {
    it('字牌は7種である', () => {
      // Assert
      expect(HONOR_TILES).toHaveLength(7);
    });

    it('風牌4種が含まれている', () => {
      // Assert
      expect(HONOR_TILES).toContain(TileType.TON);
      expect(HONOR_TILES).toContain(TileType.NAN);
      expect(HONOR_TILES).toContain(TileType.SHAA);
      expect(HONOR_TILES).toContain(TileType.PEI);
    });

    it('三元牌3種が含まれている', () => {
      // Assert
      expect(HONOR_TILES).toContain(TileType.HAKU);
      expect(HONOR_TILES).toContain(TileType.HATSU);
      expect(HONOR_TILES).toContain(TileType.CHUN);
    });

    it('数牌が含まれていない', () => {
      // Assert
      expect(HONOR_TILES).not.toContain(TileType.MAN1);
      expect(HONOR_TILES).not.toContain(TileType.PIN1);
      expect(HONOR_TILES).not.toContain(TileType.SOU1);
    });
  });

  describe('DORA_TILES', () => {
    it('赤ドラは3種である', () => {
      // Assert
      expect(DORA_TILES).toHaveLength(3);
    });

    it('赤五萬が含まれている', () => {
      // Assert
      expect(DORA_TILES).toContain(TileType.MAN5_DORA);
    });

    it('赤五筒が含まれている', () => {
      // Assert
      expect(DORA_TILES).toContain(TileType.PIN5_DORA);
    });

    it('赤五索が含まれている', () => {
      // Assert
      expect(DORA_TILES).toContain(TileType.SOU5_DORA);
    });

    it('通常の5が含まれていない', () => {
      // Assert
      expect(DORA_TILES).not.toContain(TileType.MAN5);
      expect(DORA_TILES).not.toContain(TileType.PIN5);
      expect(DORA_TILES).not.toContain(TileType.SOU5);
    });
  });

  describe('ALL_GAME_TILES', () => {
    it('ゲーム用牌は34種である（数牌27 + 字牌7）', () => {
      // Assert
      expect(ALL_GAME_TILES).toHaveLength(34);
    });

    it('NUMBER_TILESの全牌が含まれている', () => {
      // Assert
      for (const tile of NUMBER_TILES) {
        expect(ALL_GAME_TILES).toContain(tile);
      }
    });

    it('HONOR_TILESの全牌が含まれている', () => {
      // Assert
      for (const tile of HONOR_TILES) {
        expect(ALL_GAME_TILES).toContain(tile);
      }
    });

    it('赤ドラが含まれていない', () => {
      // Assert
      for (const tile of DORA_TILES) {
        expect(ALL_GAME_TILES).not.toContain(tile);
      }
    });

    it('特殊牌（BACK, FRONT, BLANK）が含まれていない', () => {
      // Assert
      expect(ALL_GAME_TILES).not.toContain(TileType.BACK);
      expect(ALL_GAME_TILES).not.toContain(TileType.FRONT);
      expect(ALL_GAME_TILES).not.toContain(TileType.BLANK);
    });

    it('重複がない', () => {
      // Arrange
      const uniqueTiles = new Set(ALL_GAME_TILES);

      // Assert
      expect(uniqueTiles.size).toBe(ALL_GAME_TILES.length);
    });
  });
});
