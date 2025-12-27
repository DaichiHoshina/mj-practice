'use client';

import { TileType, getTilePath } from '@/lib/tiles';
import styles from './Tile.module.css';

/** Tileコンポーネントのプロパティ */
export interface TileProps {
  /** 牌の種類 */
  tile: TileType;
  /** クリック時のコールバック */
  onClick?: () => void;
  /** 選択状態 */
  selected?: boolean;
  /** 無効状態 */
  disabled?: boolean;
  /** サイズ */
  size?: 'small' | 'medium' | 'large';
}

/**
 * 麻雀牌を表示するコンポーネント
 */
export function Tile({
  tile,
  onClick,
  selected = false,
  disabled = false,
  size = 'medium',
}: TileProps) {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.key === 'Enter' || event.key === ' ') && !disabled && onClick) {
      event.preventDefault();
      onClick();
    }
  };

  const classNames = [
    styles.tile,
    styles[size],
    selected && styles.selected,
    disabled && styles.disabled,
    onClick && !disabled && styles.clickable,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-pressed={onClick ? selected : undefined}
      aria-disabled={disabled}
    >
      <img
        src={getTilePath(tile)}
        alt={tile}
        className={styles.image}
        draggable={false}
      />
    </div>
  );
}
