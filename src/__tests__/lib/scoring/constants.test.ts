/**
 * scoring/constants.ts のテスト
 * 役定義、符計算定数、満貫以上の点数定数を検証
 */

import {
  YAKU_DEFINITIONS,
  FU_TABLE,
  MANGAN_SCORES,
} from '@/lib/scoring/constants';

describe('YAKU_DEFINITIONS', () => {
  it('27種の役が定義されている', () => {
    // Assert
    expect(YAKU_DEFINITIONS).toHaveLength(27);
  });

  it('各役に必須プロパティが存在する', () => {
    // Act & Assert
    for (const yaku of YAKU_DEFINITIONS) {
      expect(yaku).toHaveProperty('id');
      expect(yaku).toHaveProperty('name');
      expect(yaku).toHaveProperty('han');
      expect(yaku).toHaveProperty('hanNaki');
      expect(yaku).toHaveProperty('isYakuman');
    }
  });

  it('IDが一意である', () => {
    // Arrange
    const ids = YAKU_DEFINITIONS.map((y) => y.id);
    const uniqueIds = new Set(ids);

    // Assert
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('nameが一意である', () => {
    // Arrange
    const names = YAKU_DEFINITIONS.map((y) => y.name);
    const uniqueNames = new Set(names);

    // Assert
    expect(uniqueNames.size).toBe(names.length);
  });

  it('IDが空文字でない', () => {
    // Act & Assert
    for (const yaku of YAKU_DEFINITIONS) {
      expect(yaku.id.length).toBeGreaterThan(0);
    }
  });

  it('nameが空文字でない', () => {
    // Act & Assert
    for (const yaku of YAKU_DEFINITIONS) {
      expect(yaku.name.length).toBeGreaterThan(0);
    }
  });

  describe('役満', () => {
    it('役満はhan=0, hanNaki=0, isYakuman=trueである', () => {
      // Arrange
      const yakumanIds = ['daisangen', 'suuankou', 'kokushimusou'];

      // Act & Assert
      for (const id of yakumanIds) {
        const yaku = YAKU_DEFINITIONS.find((y) => y.id === id);
        expect(yaku).toBeDefined();
        expect(yaku!.han).toBe(0);
        expect(yaku!.hanNaki).toBe(0);
        expect(yaku!.isYakuman).toBe(true);
      }
    });

    it('役満は3種定義されている', () => {
      // Arrange
      const yakuman = YAKU_DEFINITIONS.filter((y) => y.isYakuman);

      // Assert
      expect(yakuman).toHaveLength(3);
    });
  });

  describe('通常役', () => {
    it('通常役はisYakuman=falseでhan > 0である', () => {
      // Arrange
      const normalYaku = YAKU_DEFINITIONS.filter((y) => !y.isYakuman);

      // Act & Assert
      for (const yaku of normalYaku) {
        expect(yaku.isYakuman).toBe(false);
        expect(yaku.han).toBeGreaterThan(0);
      }
    });

    it('hanNakiはhan以下である（鳴くと翻数が下がるか無効になる）', () => {
      // Arrange
      const normalYaku = YAKU_DEFINITIONS.filter((y) => !y.isYakuman);

      // Act & Assert
      for (const yaku of normalYaku) {
        expect(yaku.hanNaki).toBeLessThanOrEqual(yaku.han);
      }
    });
  });

  describe('鳴き不可の役', () => {
    it('リーチは鳴き不可（hanNaki=0）', () => {
      // Arrange
      const riichi = YAKU_DEFINITIONS.find((y) => y.id === 'riichi');

      // Assert
      expect(riichi).toBeDefined();
      expect(riichi!.hanNaki).toBe(0);
    });

    it('平和は鳴き不可（hanNaki=0）', () => {
      // Arrange
      const pinfu = YAKU_DEFINITIONS.find((y) => y.id === 'pinfu');

      // Assert
      expect(pinfu).toBeDefined();
      expect(pinfu!.hanNaki).toBe(0);
    });

    it('一盃口は鳴き不可（hanNaki=0）', () => {
      // Arrange
      const iipeikou = YAKU_DEFINITIONS.find((y) => y.id === 'iipeikou');

      // Assert
      expect(iipeikou).toBeDefined();
      expect(iipeikou!.hanNaki).toBe(0);
    });

    it('七対子は鳴き不可（hanNaki=0）', () => {
      // Arrange
      const chiitoitsu = YAKU_DEFINITIONS.find((y) => y.id === 'chiitoitsu');

      // Assert
      expect(chiitoitsu).toBeDefined();
      expect(chiitoitsu!.hanNaki).toBe(0);
    });
  });

  describe('翻数の検証', () => {
    it('1翻役が正しく定義されている', () => {
      // Arrange
      const oneHanIds = [
        'riichi',
        'tanyao',
        'pinfu',
        'iipeikou',
        'yakuhai_ton',
        'yakuhai_nan',
        'yakuhai_shaa',
        'yakuhai_pei',
        'yakuhai_haku',
        'yakuhai_hatsu',
        'yakuhai_chun',
      ];

      // Act & Assert
      for (const id of oneHanIds) {
        const yaku = YAKU_DEFINITIONS.find((y) => y.id === id);
        expect(yaku).toBeDefined();
        expect(yaku!.han).toBe(1);
      }
    });

    it('2翻役が正しく定義されている', () => {
      // Arrange
      const twoHanIds = [
        'sanshoku_doujun',
        'ikkitsuukan',
        'chanta',
        'toitoi',
        'sanankou',
        'sanshoku_doukou',
        'chiitoitsu',
        'sankantsu',
        'honroutou',
        'shousangen',
      ];

      // Act & Assert
      for (const id of twoHanIds) {
        const yaku = YAKU_DEFINITIONS.find((y) => y.id === id);
        expect(yaku).toBeDefined();
        expect(yaku!.han).toBe(2);
      }
    });

    it('3翻役が正しく定義されている', () => {
      // Arrange
      const threeHanIds = ['honitsu', 'junchan'];

      // Act & Assert
      for (const id of threeHanIds) {
        const yaku = YAKU_DEFINITIONS.find((y) => y.id === id);
        expect(yaku).toBeDefined();
        expect(yaku!.han).toBe(3);
      }
    });

    it('清一色は6翻である', () => {
      // Arrange
      const chinitsu = YAKU_DEFINITIONS.find((y) => y.id === 'chinitsu');

      // Assert
      expect(chinitsu).toBeDefined();
      expect(chinitsu!.han).toBe(6);
      expect(chinitsu!.hanNaki).toBe(5);
    });
  });

  describe('食い下がりの検証', () => {
    it('三色同順は鳴くと1翻下がる', () => {
      // Arrange
      const sanshoku = YAKU_DEFINITIONS.find((y) => y.id === 'sanshoku_doujun');

      // Assert
      expect(sanshoku).toBeDefined();
      expect(sanshoku!.han).toBe(2);
      expect(sanshoku!.hanNaki).toBe(1);
    });

    it('一気通貫は鳴くと1翻下がる', () => {
      // Arrange
      const ikkitsuukan = YAKU_DEFINITIONS.find((y) => y.id === 'ikkitsuukan');

      // Assert
      expect(ikkitsuukan).toBeDefined();
      expect(ikkitsuukan!.han).toBe(2);
      expect(ikkitsuukan!.hanNaki).toBe(1);
    });

    it('チャンタは鳴くと1翻下がる', () => {
      // Arrange
      const chanta = YAKU_DEFINITIONS.find((y) => y.id === 'chanta');

      // Assert
      expect(chanta).toBeDefined();
      expect(chanta!.han).toBe(2);
      expect(chanta!.hanNaki).toBe(1);
    });

    it('混一色は鳴くと1翻下がる', () => {
      // Arrange
      const honitsu = YAKU_DEFINITIONS.find((y) => y.id === 'honitsu');

      // Assert
      expect(honitsu).toBeDefined();
      expect(honitsu!.han).toBe(3);
      expect(honitsu!.hanNaki).toBe(2);
    });

    it('対々和は鳴いても翻数が変わらない', () => {
      // Arrange
      const toitoi = YAKU_DEFINITIONS.find((y) => y.id === 'toitoi');

      // Assert
      expect(toitoi).toBeDefined();
      expect(toitoi!.han).toBe(2);
      expect(toitoi!.hanNaki).toBe(2);
    });

    it('タンヤオは鳴いても翻数が変わらない', () => {
      // Arrange
      const tanyao = YAKU_DEFINITIONS.find((y) => y.id === 'tanyao');

      // Assert
      expect(tanyao).toBeDefined();
      expect(tanyao!.han).toBe(1);
      expect(tanyao!.hanNaki).toBe(1);
    });
  });
});

describe('FU_TABLE', () => {
  describe('副底', () => {
    it('副底は20符である', () => {
      // Assert
      expect(FU_TABLE.BASE).toBe(20);
    });
  });

  describe('面子符', () => {
    it('順子は0符である', () => {
      // Assert
      expect(FU_TABLE.MENTSU.SHUNTSU).toBe(0);
    });

    it('暗刻は明刻の2倍である', () => {
      // Assert - 中張
      expect(FU_TABLE.MENTSU.CHUNCHAN_ANKOU).toBe(
        FU_TABLE.MENTSU.CHUNCHAN_MINKOU * 2
      );

      // Assert - 么九
      expect(FU_TABLE.MENTSU.YAOCHUU_ANKOU).toBe(
        FU_TABLE.MENTSU.YAOCHUU_MINKOU * 2
      );
    });

    it('么九は中張の2倍である', () => {
      // Assert - 明刻
      expect(FU_TABLE.MENTSU.YAOCHUU_MINKOU).toBe(
        FU_TABLE.MENTSU.CHUNCHAN_MINKOU * 2
      );

      // Assert - 暗刻
      expect(FU_TABLE.MENTSU.YAOCHUU_ANKOU).toBe(
        FU_TABLE.MENTSU.CHUNCHAN_ANKOU * 2
      );
    });

    it('槓子は刻子の4倍である', () => {
      // Assert - 中張明
      expect(FU_TABLE.MENTSU.CHUNCHAN_MINKAN).toBe(
        FU_TABLE.MENTSU.CHUNCHAN_MINKOU * 4
      );

      // Assert - 中張暗
      expect(FU_TABLE.MENTSU.CHUNCHAN_ANKAN).toBe(
        FU_TABLE.MENTSU.CHUNCHAN_ANKOU * 4
      );

      // Assert - 么九明
      expect(FU_TABLE.MENTSU.YAOCHUU_MINKAN).toBe(
        FU_TABLE.MENTSU.YAOCHUU_MINKOU * 4
      );

      // Assert - 么九暗
      expect(FU_TABLE.MENTSU.YAOCHUU_ANKAN).toBe(
        FU_TABLE.MENTSU.YAOCHUU_ANKOU * 4
      );
    });

    it('面子符の具体的な値が正しい', () => {
      // Assert
      expect(FU_TABLE.MENTSU.CHUNCHAN_MINKOU).toBe(2);
      expect(FU_TABLE.MENTSU.CHUNCHAN_ANKOU).toBe(4);
      expect(FU_TABLE.MENTSU.YAOCHUU_MINKOU).toBe(4);
      expect(FU_TABLE.MENTSU.YAOCHUU_ANKOU).toBe(8);
      expect(FU_TABLE.MENTSU.CHUNCHAN_MINKAN).toBe(8);
      expect(FU_TABLE.MENTSU.CHUNCHAN_ANKAN).toBe(16);
      expect(FU_TABLE.MENTSU.YAOCHUU_MINKAN).toBe(16);
      expect(FU_TABLE.MENTSU.YAOCHUU_ANKAN).toBe(32);
    });

    it('面子符は暗 > 明の関係を満たす', () => {
      // Assert
      expect(FU_TABLE.MENTSU.CHUNCHAN_ANKOU).toBeGreaterThan(
        FU_TABLE.MENTSU.CHUNCHAN_MINKOU
      );
      expect(FU_TABLE.MENTSU.YAOCHUU_ANKOU).toBeGreaterThan(
        FU_TABLE.MENTSU.YAOCHUU_MINKOU
      );
      expect(FU_TABLE.MENTSU.CHUNCHAN_ANKAN).toBeGreaterThan(
        FU_TABLE.MENTSU.CHUNCHAN_MINKAN
      );
      expect(FU_TABLE.MENTSU.YAOCHUU_ANKAN).toBeGreaterThan(
        FU_TABLE.MENTSU.YAOCHUU_MINKAN
      );
    });

    it('面子符は么九 > 中張の関係を満たす', () => {
      // Assert
      expect(FU_TABLE.MENTSU.YAOCHUU_MINKOU).toBeGreaterThan(
        FU_TABLE.MENTSU.CHUNCHAN_MINKOU
      );
      expect(FU_TABLE.MENTSU.YAOCHUU_ANKOU).toBeGreaterThan(
        FU_TABLE.MENTSU.CHUNCHAN_ANKOU
      );
      expect(FU_TABLE.MENTSU.YAOCHUU_MINKAN).toBeGreaterThan(
        FU_TABLE.MENTSU.CHUNCHAN_MINKAN
      );
      expect(FU_TABLE.MENTSU.YAOCHUU_ANKAN).toBeGreaterThan(
        FU_TABLE.MENTSU.CHUNCHAN_ANKAN
      );
    });

    it('面子符は槓 > 刻の関係を満たす', () => {
      // Assert
      expect(FU_TABLE.MENTSU.CHUNCHAN_MINKAN).toBeGreaterThan(
        FU_TABLE.MENTSU.CHUNCHAN_MINKOU
      );
      expect(FU_TABLE.MENTSU.CHUNCHAN_ANKAN).toBeGreaterThan(
        FU_TABLE.MENTSU.CHUNCHAN_ANKOU
      );
      expect(FU_TABLE.MENTSU.YAOCHUU_MINKAN).toBeGreaterThan(
        FU_TABLE.MENTSU.YAOCHUU_MINKOU
      );
      expect(FU_TABLE.MENTSU.YAOCHUU_ANKAN).toBeGreaterThan(
        FU_TABLE.MENTSU.YAOCHUU_ANKOU
      );
    });
  });

  describe('その他の符', () => {
    it('雀頭符は2符である', () => {
      // Assert
      expect(FU_TABLE.JANTOU).toBe(2);
    });

    it('待ち符は2符である', () => {
      // Assert
      expect(FU_TABLE.MACHI).toBe(2);
    });

    it('ツモ符は2符である', () => {
      // Assert
      expect(FU_TABLE.TSUMO).toBe(2);
    });

    it('門前ロン符は10符である', () => {
      // Assert
      expect(FU_TABLE.MENZEN_RON).toBe(10);
    });

    it('符の切り上げ単位は10符である', () => {
      // Assert
      expect(FU_TABLE.ROUND_UP_UNIT).toBe(10);
    });
  });
});

describe('MANGAN_SCORES', () => {
  const ranks = [
    'MANGAN',
    'HANEMAN',
    'BAIMAN',
    'SANBAIMAN',
    'KAZOE_YAKUMAN',
    'YAKUMAN',
  ] as const;

  describe('構造の検証', () => {
    it.each(ranks)('%s に必要な全プロパティが存在する', (rank) => {
      // Arrange
      const score = MANGAN_SCORES[rank];

      // Assert
      expect(score).toHaveProperty('DEALER_TSUMO');
      expect(score).toHaveProperty('DEALER_RON');
      expect(score).toHaveProperty('NON_DEALER_TSUMO');
      expect(score).toHaveProperty('NON_DEALER_RON');
    });

    it.each(ranks)('%s の親ツモにtotalとeachがある', (rank) => {
      // Arrange
      const tsumo = MANGAN_SCORES[rank].DEALER_TSUMO;

      // Assert
      expect(tsumo).toHaveProperty('total');
      expect(tsumo).toHaveProperty('each');
    });

    it.each(ranks)('%s の子ツモにtotal, dealer, nonDealerがある', (rank) => {
      // Arrange
      const tsumo = MANGAN_SCORES[rank].NON_DEALER_TSUMO;

      // Assert
      expect(tsumo).toHaveProperty('total');
      expect(tsumo).toHaveProperty('dealer');
      expect(tsumo).toHaveProperty('nonDealer');
    });
  });

  describe('満貫の点数', () => {
    it('親ロンは12000点である', () => {
      // Assert
      expect(MANGAN_SCORES.MANGAN.DEALER_RON).toBe(12000);
    });

    it('子ロンは8000点である', () => {
      // Assert
      expect(MANGAN_SCORES.MANGAN.NON_DEALER_RON).toBe(8000);
    });

    it('親ツモは各4000点、合計12000点である', () => {
      // Assert
      expect(MANGAN_SCORES.MANGAN.DEALER_TSUMO.each).toBe(4000);
      expect(MANGAN_SCORES.MANGAN.DEALER_TSUMO.total).toBe(12000);
    });

    it('子ツモは親4000点、子2000点、合計8000点である', () => {
      // Assert
      expect(MANGAN_SCORES.MANGAN.NON_DEALER_TSUMO.dealer).toBe(4000);
      expect(MANGAN_SCORES.MANGAN.NON_DEALER_TSUMO.nonDealer).toBe(2000);
      expect(MANGAN_SCORES.MANGAN.NON_DEALER_TSUMO.total).toBe(8000);
    });
  });

  describe('各ランク間の倍率関係', () => {
    it('跳満 = 満貫 * 1.5', () => {
      // Assert
      expect(MANGAN_SCORES.HANEMAN.DEALER_RON).toBe(
        MANGAN_SCORES.MANGAN.DEALER_RON * 1.5
      );
      expect(MANGAN_SCORES.HANEMAN.NON_DEALER_RON).toBe(
        MANGAN_SCORES.MANGAN.NON_DEALER_RON * 1.5
      );
    });

    it('倍満 = 満貫 * 2', () => {
      // Assert
      expect(MANGAN_SCORES.BAIMAN.DEALER_RON).toBe(
        MANGAN_SCORES.MANGAN.DEALER_RON * 2
      );
      expect(MANGAN_SCORES.BAIMAN.NON_DEALER_RON).toBe(
        MANGAN_SCORES.MANGAN.NON_DEALER_RON * 2
      );
    });

    it('三倍満 = 満貫 * 3', () => {
      // Assert
      expect(MANGAN_SCORES.SANBAIMAN.DEALER_RON).toBe(
        MANGAN_SCORES.MANGAN.DEALER_RON * 3
      );
      expect(MANGAN_SCORES.SANBAIMAN.NON_DEALER_RON).toBe(
        MANGAN_SCORES.MANGAN.NON_DEALER_RON * 3
      );
    });

    it('役満 = 満貫 * 4', () => {
      // Assert
      expect(MANGAN_SCORES.YAKUMAN.DEALER_RON).toBe(
        MANGAN_SCORES.MANGAN.DEALER_RON * 4
      );
      expect(MANGAN_SCORES.YAKUMAN.NON_DEALER_RON).toBe(
        MANGAN_SCORES.MANGAN.NON_DEALER_RON * 4
      );
    });

    it('数え役満 = 役満と同じ点数', () => {
      // Assert
      expect(MANGAN_SCORES.KAZOE_YAKUMAN.DEALER_RON).toBe(
        MANGAN_SCORES.YAKUMAN.DEALER_RON
      );
      expect(MANGAN_SCORES.KAZOE_YAKUMAN.NON_DEALER_RON).toBe(
        MANGAN_SCORES.YAKUMAN.NON_DEALER_RON
      );
      expect(MANGAN_SCORES.KAZOE_YAKUMAN.DEALER_TSUMO.total).toBe(
        MANGAN_SCORES.YAKUMAN.DEALER_TSUMO.total
      );
      expect(MANGAN_SCORES.KAZOE_YAKUMAN.NON_DEALER_TSUMO.total).toBe(
        MANGAN_SCORES.YAKUMAN.NON_DEALER_TSUMO.total
      );
    });
  });

  describe('親と子の関係', () => {
    it.each(ranks)('%s: 親ロン = 子ロン * 1.5', (rank) => {
      // Arrange
      const score = MANGAN_SCORES[rank];

      // Assert
      expect(score.DEALER_RON).toBe(score.NON_DEALER_RON * 1.5);
    });

    it.each(ranks)('%s: 親ツモtotal = 子ツモtotal * 1.5', (rank) => {
      // Arrange
      const score = MANGAN_SCORES[rank];

      // Assert
      expect(score.DEALER_TSUMO.total).toBe(score.NON_DEALER_TSUMO.total * 1.5);
    });
  });

  describe('ツモ時の支払い関係', () => {
    it.each(ranks)('%s: 子ツモ時、親払い = 子払い * 2', (rank) => {
      // Arrange
      const tsumo = MANGAN_SCORES[rank].NON_DEALER_TSUMO;

      // Assert
      expect(tsumo.dealer).toBe(tsumo.nonDealer * 2);
    });

    it.each(ranks)('%s: 子ツモtotal = 親払い + 子払い*2', (rank) => {
      // Arrange
      const tsumo = MANGAN_SCORES[rank].NON_DEALER_TSUMO;

      // Assert
      expect(tsumo.total).toBe(tsumo.dealer + tsumo.nonDealer * 2);
    });

    it.each(ranks)('%s: 親ツモtotal = each * 3', (rank) => {
      // Arrange
      const tsumo = MANGAN_SCORES[rank].DEALER_TSUMO;

      // Assert
      expect(tsumo.total).toBe(tsumo.each * 3);
    });
  });

  describe('ロンとツモの合計一致', () => {
    it.each(ranks)('%s: 親ロン = 親ツモtotal', (rank) => {
      // Arrange
      const score = MANGAN_SCORES[rank];

      // Assert
      expect(score.DEALER_RON).toBe(score.DEALER_TSUMO.total);
    });

    it.each(ranks)('%s: 子ロン = 子ツモtotal', (rank) => {
      // Arrange
      const score = MANGAN_SCORES[rank];

      // Assert
      expect(score.NON_DEALER_RON).toBe(score.NON_DEALER_TSUMO.total);
    });
  });

  describe('具体的な点数値', () => {
    it('跳満: 親18000/子12000', () => {
      // Assert
      expect(MANGAN_SCORES.HANEMAN.DEALER_RON).toBe(18000);
      expect(MANGAN_SCORES.HANEMAN.NON_DEALER_RON).toBe(12000);
    });

    it('倍満: 親24000/子16000', () => {
      // Assert
      expect(MANGAN_SCORES.BAIMAN.DEALER_RON).toBe(24000);
      expect(MANGAN_SCORES.BAIMAN.NON_DEALER_RON).toBe(16000);
    });

    it('三倍満: 親36000/子24000', () => {
      // Assert
      expect(MANGAN_SCORES.SANBAIMAN.DEALER_RON).toBe(36000);
      expect(MANGAN_SCORES.SANBAIMAN.NON_DEALER_RON).toBe(24000);
    });

    it('役満: 親48000/子32000', () => {
      // Assert
      expect(MANGAN_SCORES.YAKUMAN.DEALER_RON).toBe(48000);
      expect(MANGAN_SCORES.YAKUMAN.NON_DEALER_RON).toBe(32000);
    });
  });
});
