export type {
  QuizCategory,
  QuizDifficulty,
  Choice,
  Question,
  QuizSession,
  QuizResult,
  MachiQuestion,
} from './types';

export {
  loadMachiQuestions,
  getMachiCandidates,
  checkMachiAnswer,
} from './machiLoader';

/**
 * クイズセッションを作成
 */
export function createQuizSession(
  questions: readonly import('./types').Question[]
): import('./types').QuizSession {
  return {
    questions,
    currentIndex: 0,
    answers: new Map(),
    startTime: new Date(),
  };
}

/**
 * クイズ結果を計算
 */
export function calculateQuizResult(
  session: import('./types').QuizSession
): import('./types').QuizResult {
  const correctCount = Array.from(session.answers.entries()).filter(
    ([questionId, answerId]) => {
      const question = session.questions.find((q) => q.id === questionId);
      return question?.correctAnswer === answerId;
    }
  ).length;

  const incorrectQuestionIds = Array.from(session.answers.entries())
    .filter(([questionId, answerId]) => {
      const question = session.questions.find((q) => q.id === questionId);
      return question?.correctAnswer !== answerId;
    })
    .map(([questionId]) => questionId);

  return {
    totalQuestions: session.questions.length,
    correctCount,
    accuracy:
      session.questions.length > 0
        ? (correctCount / session.questions.length) * 100
        : 0,
    incorrectQuestionIds,
  };
}
