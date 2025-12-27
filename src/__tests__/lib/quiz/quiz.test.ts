import { describe, it, expect } from '@jest/globals';
import {
  createQuizSession,
  calculateQuizResult,
  Question,
  QuizSession,
} from '@/lib/quiz';
import {
  loadQuestions,
  loadMixedQuestions,
  getQuestionCount,
} from '@/lib/quiz/loader';

describe('Quiz Logic', () => {
  describe('createQuizSession', () => {
    it('正しくセッションを作成できる', () => {
      // Arrange
      const questions: Question[] = [
        {
          id: 'test1',
          category: 'shanten',
          difficulty: 'easy',
          title: 'Test Question',
          hand: ['1m', '2m', '3m'],
          correctAnswer: 'a',
          choices: [
            { id: 'a', label: 'Answer A' },
            { id: 'b', label: 'Answer B' },
          ],
          explanation: 'Test explanation',
        },
      ];

      // Act
      const session = createQuizSession(questions);

      // Assert
      expect(session.questions).toEqual(questions);
      expect(session.currentIndex).toBe(0);
      expect(session.answers.size).toBe(0);
      expect(session.startTime).toBeInstanceOf(Date);
    });

    it('空の問題リストでもセッションを作成できる', () => {
      // Arrange
      const questions: Question[] = [];

      // Act
      const session = createQuizSession(questions);

      // Assert
      expect(session.questions).toEqual([]);
      expect(session.currentIndex).toBe(0);
    });
  });

  describe('calculateQuizResult', () => {
    it('正解数と正解率を正しく計算できる', () => {
      // Arrange
      const questions: Question[] = [
        {
          id: 'q1',
          category: 'shanten',
          difficulty: 'easy',
          title: 'Question 1',
          hand: ['1m'],
          correctAnswer: 'a',
          choices: [
            { id: 'a', label: 'A' },
            { id: 'b', label: 'B' },
          ],
          explanation: 'Explanation 1',
        },
        {
          id: 'q2',
          category: 'shanten',
          difficulty: 'easy',
          title: 'Question 2',
          hand: ['2m'],
          correctAnswer: 'b',
          choices: [
            { id: 'a', label: 'A' },
            { id: 'b', label: 'B' },
          ],
          explanation: 'Explanation 2',
        },
        {
          id: 'q3',
          category: 'shanten',
          difficulty: 'easy',
          title: 'Question 3',
          hand: ['3m'],
          correctAnswer: 'a',
          choices: [
            { id: 'a', label: 'A' },
            { id: 'b', label: 'B' },
          ],
          explanation: 'Explanation 3',
        },
      ];

      const answers = new Map<string, string>([
        ['q1', 'a'], // 正解
        ['q2', 'a'], // 不正解
        ['q3', 'a'], // 正解
      ]);

      const session: QuizSession = {
        questions,
        currentIndex: 3,
        answers,
        startTime: new Date(),
      };

      // Act
      const result = calculateQuizResult(session);

      // Assert
      expect(result.totalQuestions).toBe(3);
      expect(result.correctCount).toBe(2);
      expect(result.accuracy).toBeCloseTo(66.67, 1);
      expect(result.incorrectQuestionIds).toEqual(['q2']);
    });

    it('全問正解の場合は100%になる', () => {
      // Arrange
      const questions: Question[] = [
        {
          id: 'q1',
          category: 'shanten',
          difficulty: 'easy',
          title: 'Question 1',
          hand: ['1m'],
          correctAnswer: 'a',
          choices: [
            { id: 'a', label: 'A' },
            { id: 'b', label: 'B' },
          ],
          explanation: 'Explanation',
        },
      ];

      const answers = new Map<string, string>([['q1', 'a']]);

      const session: QuizSession = {
        questions,
        currentIndex: 1,
        answers,
        startTime: new Date(),
      };

      // Act
      const result = calculateQuizResult(session);

      // Assert
      expect(result.accuracy).toBe(100);
      expect(result.incorrectQuestionIds).toEqual([]);
    });

    it('全問不正解の場合は0%になる', () => {
      // Arrange
      const questions: Question[] = [
        {
          id: 'q1',
          category: 'shanten',
          difficulty: 'easy',
          title: 'Question 1',
          hand: ['1m'],
          correctAnswer: 'a',
          choices: [
            { id: 'a', label: 'A' },
            { id: 'b', label: 'B' },
          ],
          explanation: 'Explanation',
        },
      ];

      const answers = new Map<string, string>([['q1', 'b']]);

      const session: QuizSession = {
        questions,
        currentIndex: 1,
        answers,
        startTime: new Date(),
      };

      // Act
      const result = calculateQuizResult(session);

      // Assert
      expect(result.accuracy).toBe(0);
      expect(result.incorrectQuestionIds).toEqual(['q1']);
    });

    it('回答がない場合は0%になる', () => {
      // Arrange
      const questions: Question[] = [
        {
          id: 'q1',
          category: 'shanten',
          difficulty: 'easy',
          title: 'Question 1',
          hand: ['1m'],
          correctAnswer: 'a',
          choices: [
            { id: 'a', label: 'A' },
            { id: 'b', label: 'B' },
          ],
          explanation: 'Explanation',
        },
      ];

      const session: QuizSession = {
        questions,
        currentIndex: 0,
        answers: new Map(),
        startTime: new Date(),
      };

      // Act
      const result = calculateQuizResult(session);

      // Assert
      expect(result.accuracy).toBe(0);
      expect(result.correctCount).toBe(0);
    });
  });

  describe('loadQuestions', () => {
    it('指定された難易度の問題を読み込める', () => {
      // Act
      const questions = loadQuestions('easy', 5);

      // Assert
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.length).toBeLessThanOrEqual(5);
      questions.forEach((q) => {
        expect(q.difficulty).toBe('easy');
      });
    });

    it('問題数が利用可能な問題数より多い場合は全問題を返す', () => {
      // Arrange
      const availableCount = getQuestionCount('easy');

      // Act
      const questions = loadQuestions('easy', availableCount + 100);

      // Assert
      expect(questions.length).toBe(availableCount);
    });

    it('medium難易度の問題を読み込める', () => {
      // Act
      const questions = loadQuestions('medium', 5);

      // Assert
      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => {
        expect(q.difficulty).toBe('medium');
      });
    });

    it('hard難易度の問題を読み込める', () => {
      // Act
      const questions = loadQuestions('hard', 5);

      // Assert
      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => {
        expect(q.difficulty).toBe('hard');
      });
    });
  });

  describe('loadMixedQuestions', () => {
    it('ミックスした問題を読み込める', () => {
      // Act
      const questions = loadMixedQuestions(10);

      // Assert
      expect(questions.length).toBe(10);
    });

    it('異なる難易度が混在する', () => {
      // Act
      const questions = loadMixedQuestions(30);

      // Assert
      const difficulties = new Set(questions.map((q) => q.difficulty));
      expect(difficulties.size).toBeGreaterThan(1);
    });
  });

  describe('getQuestionCount', () => {
    it('特定の難易度の問題数を取得できる', () => {
      // Act
      const count = getQuestionCount('easy');

      // Assert
      expect(count).toBeGreaterThan(0);
    });

    it('全問題数を取得できる', () => {
      // Act
      const totalCount = getQuestionCount();

      // Assert
      expect(totalCount).toBeGreaterThan(0);
    });

    it('難易度別の合計が全問題数と一致する', () => {
      // Arrange
      const easyCount = getQuestionCount('easy');
      const mediumCount = getQuestionCount('medium');
      const hardCount = getQuestionCount('hard');
      const totalCount = getQuestionCount();

      // Assert
      expect(easyCount + mediumCount + hardCount).toBe(totalCount);
    });
  });
});
