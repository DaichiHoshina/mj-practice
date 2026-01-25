import { QuizGame } from '@/components/Quiz/QuizGame';
import { BackButton } from '@/components/common/BackButton';
import styles from './page.module.css';

export default function EfficiencyQuizPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <BackButton href="/" label="クイズ選択に戻る" />
        <h1 className={styles.title}>牌効率クイズ</h1>
        <p className={styles.description}>
          手牌を見て、どの牌を切るべきかを選ぶクイズです。
          <br />
          向聴数を下げる最適な打牌を学び、牌効率の実力をアップさせましょう！
        </p>
        <QuizGame category="effective" />
      </div>
    </main>
  );
}
