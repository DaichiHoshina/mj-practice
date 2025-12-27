'use client';

import { Choice } from '@/lib/quiz/types';
import styles from './ChoiceButton.module.css';

export interface ChoiceButtonProps {
  /** 選択肢 */
  choice: Choice;
  /** クリック時のコールバック */
  onClick: (choiceId: string) => void;
  /** 選択状態 */
  selected: boolean;
  /** 正解かどうか */
  isCorrect?: boolean;
  /** 無効状態 */
  disabled: boolean;
}

/**
 * クイズの選択肢ボタンコンポーネント
 */
export function ChoiceButton({
  choice,
  onClick,
  selected,
  isCorrect,
  disabled,
}: ChoiceButtonProps) {
  const handleClick = () => {
    if (!disabled) {
      onClick(choice.id);
    }
  };

  const getButtonClass = () => {
    const classes = [styles.button];

    if (selected && isCorrect !== undefined) {
      classes.push(isCorrect ? styles.correct : styles.incorrect);
    } else if (selected) {
      classes.push(styles.selected);
    }

    if (disabled && !selected) {
      classes.push(styles.disabled);
    }

    return classes.join(' ');
  };

  return (
    <button
      className={getButtonClass()}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={selected}
    >
      <span className={styles.choiceId}>{choice.id.toUpperCase()}</span>
      <span className={styles.label}>{choice.label}</span>
    </button>
  );
}
