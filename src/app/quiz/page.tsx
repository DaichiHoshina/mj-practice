import { QuizGame } from '@/components/Quiz/QuizGame';
import styles from './page.module.css';

/**
 * クイズページ
 */
export default function QuizPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>麻雀向聴数クイズ</h1>
        <p className={styles.description}>
          手牌を見て、何向聴かを当てるクイズです。
          <br />
          向聴数の理解を深めて、麻雀の実力をアップさせましょう！
        </p>
        <QuizGame />
      </div>
    </main>
  );
}
