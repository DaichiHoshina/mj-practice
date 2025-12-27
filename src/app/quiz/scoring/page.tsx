import { ScoringQuizGame } from '@/components/Quiz/ScoringQuizGame';
import styles from './page.module.css';

/**
 * 点数計算クイズページ
 */
export default function ScoringQuizPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>麻雀点数計算クイズ</h1>
        <p className={styles.description}>
          和了手牌から適切な点数を計算するクイズです。
          <br />
          役の認識と点数計算の理解を深めて、麻雀の実力をアップさせましょう！
        </p>
        <ScoringQuizGame />
      </div>
    </main>
  );
}
