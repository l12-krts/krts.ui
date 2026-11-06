import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, GestureArea, KRTS_EVENTS } from '../src';

function setup(ui: React.ReactElement) {
  const user = userEvent.setup({ delay: null });
  render(ui);
  return user;
}

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

describe('tap gestures', () => {
  it('fires onSingleTap immediately when no double tap is possible', async () => {
    const onSingleTap = vi.fn();
    const user = setup(<Button onSingleTap={onSingleTap}>Tap</Button>);
    await user.click(screen.getByRole('button'));
    expect(onSingleTap).toHaveBeenCalledTimes(1);
    expect(onSingleTap.mock.calls[0]![0]).toMatchObject({ type: 'singletap', count: 1 });
  });

  it('waits for the double-tap window before a single tap', async () => {
    const onSingleTap = vi.fn();
    const onDoubleTap = vi.fn();
    const user = setup(
      <Button onSingleTap={onSingleTap} onDoubleTap={onDoubleTap} multiTapDelay={250}>
        Tap
      </Button>,
    );
    await user.click(screen.getByRole('button'));
    expect(onSingleTap).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(260));
    expect(onSingleTap).toHaveBeenCalledTimes(1);
    expect(onDoubleTap).not.toHaveBeenCalled();
  });

  it('fires onDoubleTap (and not onSingleTap) for two quick taps', async () => {
    const onSingleTap = vi.fn();
    const onDoubleTap = vi.fn();
    const user = setup(
      <Button onSingleTap={onSingleTap} onDoubleTap={onDoubleTap}>
        Tap
      </Button>,
    );
    await user.dblClick(screen.getByRole('button'));
    act(() => vi.advanceTimersByTime(300));
    expect(onDoubleTap).toHaveBeenCalledTimes(1);
    expect(onSingleTap).not.toHaveBeenCalled();
  });

  it('reports the tap count with onMultiTap', async () => {
    const onMultiTap = vi.fn();
    const user = setup(<Button onMultiTap={onMultiTap} maxTaps={5}>Tap</Button>);
    const btn = screen.getByRole('button');
    await user.click(btn);
    await user.click(btn);
    await user.click(btn);
    act(() => vi.advanceTimersByTime(300));
    expect(onMultiTap).toHaveBeenCalledTimes(1);
    expect(onMultiTap.mock.calls[0]![0].count).toBe(3);
  });

  it('dispatches bubbling krts:* DOM events', async () => {
    const listener = vi.fn();
    const user = setup(
      <div onClickCapture={() => {}} ref={(el) => el?.addEventListener(KRTS_EVENTS.singleTap, listener)}>
        <Button onSingleTap={() => {}}>Tap</Button>
      </div>,
    );
    await user.click(screen.getByRole('button'));
    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0]![0] as CustomEvent).detail.count).toBe(1);
  });
});

describe('hold gestures', () => {
  it('fires onHold after holdDuration via the keyboard, and suppresses the tap', async () => {
    const onHold = vi.fn();
    const onHoldEnd = vi.fn();
    const onSingleTap = vi.fn();
    const user = setup(
      <GestureArea aria-label="area" onHold={onHold} onHoldEnd={onHoldEnd} onSingleTap={onSingleTap} holdDuration={500} />,
    );
    const area = screen.getByRole('button', { name: 'area' });
    act(() => area.focus());
    await user.keyboard('[Space>]');
    act(() => vi.advanceTimersByTime(400));
    expect(onHold).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(150));
    expect(onHold).toHaveBeenCalledTimes(1);
    expect(area).toHaveAttribute('data-held');
    await user.keyboard('[/Space]');
    act(() => vi.advanceTimersByTime(300));
    expect(onHoldEnd).toHaveBeenCalledTimes(1);
    expect(onSingleTap).not.toHaveBeenCalled();
  });

  it('fires onHoldCancel when released early, and still counts the tap', async () => {
    const onHold = vi.fn();
    const onHoldCancel = vi.fn();
    const onSingleTap = vi.fn();
    const user = setup(<Button onHold={onHold} onHoldCancel={onHoldCancel} onSingleTap={onSingleTap}>Hold</Button>);
    await user.click(screen.getByRole('button'));
    act(() => vi.advanceTimersByTime(1000));
    expect(onHold).not.toHaveBeenCalled();
    expect(onHoldCancel).toHaveBeenCalledTimes(1);
    expect(onSingleTap).toHaveBeenCalledTimes(1);
  });

  it('ticks every second while held (hold(sec))', async () => {
    const ticks: number[] = [];
    const user = setup(
      <Button holdDuration={3000} onHold={() => {}} onHoldTick={(e) => ticks.push(e.seconds)}>
        Hold
      </Button>,
    );
    act(() => screen.getByRole('button').focus());
    await user.keyboard('[Enter>]');
    act(() => vi.advanceTimersByTime(3050));
    await user.keyboard('[/Enter]');
    expect(ticks).toEqual([1, 2, 3]);
  });

  it('does nothing when disabled', async () => {
    const onSingleTap = vi.fn();
    const user = setup(<Button isDisabled onSingleTap={onSingleTap}>Tap</Button>);
    await user.click(screen.getByRole('button'));
    act(() => vi.advanceTimersByTime(300));
    expect(onSingleTap).not.toHaveBeenCalled();
  });
});
