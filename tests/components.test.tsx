import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook } from '@testing-library/react';
import { Button, HoldButton, Toaster, toast, useSmoothPending } from '../src';

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

const user = () => userEvent.setup({ delay: null });

describe('HoldButton', () => {
  it('confirms after being held for holdDuration', async () => {
    const onConfirm = vi.fn();
    const u = user();
    render(<HoldButton onConfirm={onConfirm} holdDuration={1000}>Delete</HoldButton>);
    const btn = screen.getByRole('button', { name: /delete/i });
    act(() => btn.focus());
    await u.keyboard('[Space>]');
    expect(btn).toHaveAttribute('data-holding');
    act(() => vi.advanceTimersByTime(1001));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(btn).toHaveAttribute('data-confirmed');
    await u.keyboard('[/Space]');
  });

  it('does not confirm on a quick press, and shows the hint', async () => {
    const onConfirm = vi.fn();
    const u = user();
    render(<HoldButton onConfirm={onConfirm}>Delete</HoldButton>);
    await u.click(screen.getByRole('button'));
    act(() => vi.advanceTimersByTime(50));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveTextContent('Hold to confirm');
  });

  it('describes how to use it to assistive tech', () => {
    render(<HoldButton onConfirm={() => {}} holdDuration={1500}>Delete</HoldButton>);
    expect(screen.getByRole('button')).toHaveAccessibleDescription('Press and hold for 1.5 seconds to confirm.');
  });
});

describe('Button', () => {
  it('calls onPress', async () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Go</Button>);
    await user().click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('useSmoothPending', () => {
  it('never shows a spinner for work faster than the delay', () => {
    const { result, rerender } = renderHook(({ p }) => useSmoothPending(p), { initialProps: { p: true } });
    act(() => vi.advanceTimersByTime(100));
    rerender({ p: false });
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(false);
  });

  it('keeps the spinner visible for minDuration once shown', () => {
    const { result, rerender } = renderHook(({ p }) => useSmoothPending(p, { delay: 100, minDuration: 500 }), {
      initialProps: { p: true },
    });
    act(() => vi.advanceTimersByTime(150));
    expect(result.current).toBe(true);
    rerender({ p: false });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(400));
    expect(result.current).toBe(false);
  });
});

describe('toast', () => {
  it('renders toasts and runs actions', async () => {
    const undo = vi.fn();
    render(<Toaster />);
    act(() => {
      toast('Archived', { action: { label: 'Undo', onPress: undo } });
    });
    expect(screen.getByRole('status')).toHaveTextContent('Archived');
    await user().click(screen.getByRole('button', { name: 'Undo' }));
    expect(undo).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByText('Archived')).not.toBeInTheDocument();
  });
});
