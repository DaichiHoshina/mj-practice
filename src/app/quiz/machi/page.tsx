import { MachiQuizGame } from '@/components/Quiz';
import styles from './page.module.css';

export default function MachiQuizPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>7枚待ちクイズ</h1>
        <p className={styles.description}>
          手牌の待ち牌を当てるクイズです。7枚の待ち牌を選択してください。
        </p>
        <MachiQuizGame />
      </div>
    </main>
  );
}
