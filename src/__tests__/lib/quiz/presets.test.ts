import { describe, it, expect } from '@jest/globals';
import {
  QUIZ_PRESETS,
  DEFAULT_PRESET,
  getPresetById,
} from '@/lib/quiz/presets';
import { QuizPreset } from '@/lib/quiz/types';

describe('presets', () => {
  describe('QUIZ_PRESETS', () => {
    it('5つのプリセットが定義されている', () => {
      // Assert
      expect(QUIZ_PRESETS).toHaveLength(5);
    });

    it('各プリセットに必須プロパティが全て存在する', () => {
      // Arrange
      const requiredKeys: (keyof QuizPreset)[] = [
        'id',
        'label',
        'difficulty',
        'questionCount',
        'description',
        'color',
        'emoji',
      ];

      // Assert
      QUIZ_PRESETS.forEach((preset) => {
        requiredKeys.forEach((key) => {
          expect(preset).toHaveProperty(key);
          expect(preset[key]).toBeDefined();
        });
      });
    });

    it('IDが一意である', () => {
      // Arrange
      const ids = QUIZ_PRESETS.map((preset) => preset.id);
      const uniqueIds = new Set(ids);

      // Assert
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('各プリセットのdifficultyが有効な値である', () => {
      // Arrange
      const validDifficulties = ['easy', 'medium', 'hard'];

      // Assert
      QUIZ_PRESETS.forEach((preset) => {
        expect(validDifficulties).toContain(preset.difficulty);
      });
    });

    it('各プリセットのquestionCountが正の整数である', () => {
      // Assert
      QUIZ_PRESETS.forEach((preset) => {
        expect(preset.questionCount).toBeGreaterThan(0);
        expect(Number.isInteger(preset.questionCount)).toBe(true);
      });
    });

    it('各プリセットのcolorがHEXカラーコード形式である', () => {
      // Assert
      QUIZ_PRESETS.forEach((preset) => {
        expect(preset.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('各プリセットのlabelが空文字でない', () => {
      // Assert
      QUIZ_PRESETS.forEach((preset) => {
        expect(preset.label.length).toBeGreaterThan(0);
      });
    });

    it('各プリセットのdescriptionが空文字でない', () => {
      // Assert
      QUIZ_PRESETS.forEach((preset) => {
        expect(preset.description.length).toBeGreaterThan(0);
      });
    });

    it('期待されるプリセットIDが存在する', () => {
      // Arrange
      const expectedIds = [
        'easy-10',
        'medium-10',
        'hard-10',
        'medium-20',
        'hard-20',
      ];

      // Assert
      const actualIds = QUIZ_PRESETS.map((preset) => preset.id);
      expectedIds.forEach((id) => {
        expect(actualIds).toContain(id);
      });
    });
  });

  describe('DEFAULT_PRESET', () => {
    it('QUIZ_PRESETS[1]と一致する（medium-10）', () => {
      // Assert
      expect(DEFAULT_PRESET).toEqual(QUIZ_PRESETS[1]);
    });

    it('idがmedium-10である', () => {
      // Assert
      expect(DEFAULT_PRESET.id).toBe('medium-10');
    });

    it('difficultyがmediumである', () => {
      // Assert
      expect(DEFAULT_PRESET.difficulty).toBe('medium');
    });

    it('questionCountが10である', () => {
      // Assert
      expect(DEFAULT_PRESET.questionCount).toBe(10);
    });

    it('必須プロパティが全て存在する', () => {
      // Arrange
      const requiredKeys: (keyof QuizPreset)[] = [
        'id',
        'label',
        'difficulty',
        'questionCount',
        'description',
        'color',
        'emoji',
      ];

      // Assert
      requiredKeys.forEach((key) => {
        expect(DEFAULT_PRESET).toHaveProperty(key);
        expect(DEFAULT_PRESET[key]).toBeDefined();
      });
    });
  });

  describe('getPresetById', () => {
    it('存在するIDで対応するプリセットを返す', () => {
      // Act
      const result = getPresetById('easy-10');

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe('easy-10');
      expect(result?.difficulty).toBe('easy');
    });

    it('存在しないIDでundefinedを返す', () => {
      // Act
      const result = getPresetById('nonexistent-id');

      // Assert
      expect(result).toBeUndefined();
    });

    it('空文字列でundefinedを返す', () => {
      // Act
      const result = getPresetById('');

      // Assert
      expect(result).toBeUndefined();
    });

    it('全プリセットIDで正しく取得できる', () => {
      // Assert
      QUIZ_PRESETS.forEach((preset) => {
        const result = getPresetById(preset.id);
        expect(result).toBeDefined();
        expect(result).toEqual(preset);
      });
    });

    it('medium-10を取得するとDEFAULT_PRESETと一致する', () => {
      // Act
      const result = getPresetById('medium-10');

      // Assert
      expect(result).toEqual(DEFAULT_PRESET);
    });

    it('大文字小文字が異なるIDではundefinedを返す', () => {
      // Act
      const result = getPresetById('EASY-10');

      // Assert
      expect(result).toBeUndefined();
    });

    it('前後にスペースがあるIDではundefinedを返す', () => {
      // Act
      const result = getPresetById(' easy-10 ');

      // Assert
      expect(result).toBeUndefined();
    });

    it('各プリセットの返り値が正しい型を持つ', () => {
      // Arrange
      const requiredKeys: (keyof QuizPreset)[] = [
        'id',
        'label',
        'difficulty',
        'questionCount',
        'description',
        'color',
        'emoji',
      ];

      // Assert
      QUIZ_PRESETS.forEach((preset) => {
        const result = getPresetById(preset.id);
        expect(result).toBeDefined();
        requiredKeys.forEach((key) => {
          expect(result).toHaveProperty(key);
        });
      });
    });
  });
});
