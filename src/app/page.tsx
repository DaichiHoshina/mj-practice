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
        <Link href="/quiz" className={styles.card}>
          <div className={styles.cardIcon}>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="12" cy="12" r="1" />
            </svg>
          </div>
          <h2 className={styles.cardTitle}>向聴数クイズ</h2>
          <p className={styles.cardDescription}>
            手牌を見て何向聴かを当てるクイズ。向聴数の感覚を鍛えます。
          </p>
          <div className={styles.cardBadge}>Phase 3</div>
        </Link>

        <Link href="/quiz/efficiency" className={styles.card}>
          <div className={styles.cardIcon}>
            <svg viewBox="0 0 24 24">
              <rect x="3" y="3" width="8" height="8" rx="1" />
              <rect x="13" y="3" width="8" height="8" rx="1" />
              <rect x="3" y="13" width="8" height="8" rx="1" />
              <rect x="13" y="13" width="8" height="8" rx="1" />
              <circle cx="7" cy="7" r="1" fill="currentColor" />
              <circle cx="17" cy="7" r="1" fill="currentColor" />
              <circle cx="7" cy="17" r="1" fill="currentColor" />
              <circle cx="17" cy="17" r="1" fill="currentColor" />
            </svg>
          </div>
          <h2 className={styles.cardTitle}>牌効率クイズ</h2>
          <p className={styles.cardDescription}>
            どの牌を切るべきかを選ぶクイズ。最適な打牌を学びます。
          </p>
          <div className={styles.cardBadge}>New</div>
        </Link>

        <Link href="/quiz/scoring" className={styles.card}>
          <div className={styles.cardIcon}>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 6v12M9 9h3a2 2 0 0 1 0 4h-3M9 15h3a2 2 0 0 0 0-4h-3" />
            </svg>
          </div>
          <h2 className={styles.cardTitle}>点数計算クイズ</h2>
          <p className={styles.cardDescription}>
            和了手牌から点数を計算。役の認識と点数計算をマスター。
          </p>
          <div className={styles.cardBadge}>Phase 2</div>
        </Link>

        <Link href="/quiz/machi" className={styles.card}>
          <div className={styles.cardIcon}>
            <svg viewBox="0 0 24 24">
              <rect x="4" y="4" width="7" height="10" rx="1" />
              <rect x="13" y="4" width="7" height="10" rx="1" />
              <line x1="6" y1="7" x2="9" y2="7" />
              <line x1="6" y1="9" x2="9" y2="9" />
              <line x1="15" y1="7" x2="18" y2="7" />
              <line x1="15" y1="9" x2="18" y2="9" />
              <path d="M4 16h16v4H4z" />
            </svg>
          </div>
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
