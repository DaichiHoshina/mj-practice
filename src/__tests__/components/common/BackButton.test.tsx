import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackButton } from '@/components/common/BackButton';

// useRouterのモック
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

describe('BackButton', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it('デフォルトで「戻る」ラベルを表示する', () => {
    render(<BackButton />);
    expect(screen.getByText('戻る')).toBeInTheDocument();
  });

  it('カスタムラベルを表示できる', () => {
    render(<BackButton label="ホームへ" />);
    expect(screen.getByText('ホームへ')).toBeInTheDocument();
  });

  it('hrefが指定されている場合、router.pushを呼び出す', () => {
    render(<BackButton href="/quiz" label="クイズ選択に戻る" />);
    
    const button = screen.getByRole('button', { name: 'クイズ選択に戻る' });
    fireEvent.click(button);
    
    expect(mockPush).toHaveBeenCalledWith('/quiz');
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('hrefが未指定の場合、router.backを呼び出す', () => {
    render(<BackButton />);
    
    const button = screen.getByRole('button', { name: '戻る' });
    fireEvent.click(button);
    
    expect(mockBack).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('アイコンが表示される', () => {
    render(<BackButton />);
    
    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    
    expect(svg).toBeInTheDocument();
  });

  it('aria-labelが設定されている', () => {
    render(<BackButton label="テストラベル" />);
    
    const button = screen.getByRole('button', { name: 'テストラベル' });
    expect(button).toHaveAttribute('aria-label', 'テストラベル');
  });

  it('type="button"が設定されている', () => {
    render(<BackButton />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });
});
