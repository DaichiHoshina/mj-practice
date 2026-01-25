import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>麻雀練習アプリ</h1>
        <p className={styles.description}>
          向聴数計算、点数計算、クイズなど、麻雀の実力向上をサポートする総合練習アプリです
        </p>
      </header>

      <div className={styles.features}>
        <Link href="/efficiency" className={styles.card}>
          <div className={styles.cardIcon}>📊</div>
          <h2 className={styles.cardTitle}>牌効率計算</h2>
          <p className={styles.cardDescription}>
            手牌から向聴数と有効牌を自動計算。牌効率の基礎を学べます。
          </p>
          <div className={styles.cardBadge}>Phase 1</div>
        </Link>

        <Link href="/quiz" className={styles.card}>
          <div className={styles.cardIcon}>🎯</div>
          <h2 className={styles.cardTitle}>向聴数クイズ</h2>
          <p className={styles.cardDescription}>
            手牌を見て何向聴かを当てるクイズ。向聴数の感覚を鍛えます。
          </p>
          <div className={styles.cardBadge}>Phase 3</div>
        </Link>

        <Link href="/quiz/efficiency" className={styles.card}>
          <div className={styles.cardIcon}>🎲</div>
          <h2 className={styles.cardTitle}>牌効率クイズ</h2>
          <p className={styles.cardDescription}>
            どの牌を切るべきかを選ぶクイズ。最適な打牌を学びます。
          </p>
          <div className={styles.cardBadge}>New</div>
        </Link>

        <Link href="/quiz/scoring" className={styles.card}>
          <div className={styles.cardIcon}>💰</div>
          <h2 className={styles.cardTitle}>点数計算クイズ</h2>
          <p className={styles.cardDescription}>
            和了手牌から点数を計算。役の認識と点数計算をマスター。
          </p>
          <div className={styles.cardBadge}>Phase 2</div>
        </Link>

        <Link href="/quiz/machi" className={styles.card}>
          <div className={styles.cardIcon}>🎴</div>
          <h2 className={styles.cardTitle}>7枚待ちクイズ</h2>
          <p className={styles.cardDescription}>
            多面待ちの待ち牌を当てるクイズ。全19パターンで待ち認識力を養います。
          </p>
          <div className={styles.cardBadge}>New</div>
        </Link>
      </div>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          各機能をクリックして、麻雀の実力を向上させましょう！
        </p>
      </footer>
    </main>
  );
}
