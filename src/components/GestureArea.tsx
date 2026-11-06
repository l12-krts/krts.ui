import { forwardRef, type HTMLAttributes } from 'react';
import { mergeProps } from 'react-aria';
import { useGesture, type GestureOptions } from '../hooks/useGesture';
import { cn, focusRing } from '../lib/cn';

export interface GestureAreaProps extends GestureOptions, Omit<HTMLAttributes<HTMLDivElement>, keyof GestureOptions | 'onContextMenu'> {
  /** Name for assistive tech. Gesture areas are focusable and act like buttons. */
  'aria-label'?: string;
}

/**
 * A focusable box that understands `onSingleTap`, `onDoubleTap`,
 * `onMultiTap`, `onHold`, `onHoldTick` and `onSwipe`. Exposes
 * `data-pressed` / `data-holding` for styling.
 *
 * Keyboard: Enter/Space taps; holding Enter/Space holds.
 */
export const GestureArea = forwardRef<HTMLDivElement, GestureAreaProps>(function GestureArea(props, ref) {
  const {
    onSingleTap,
    onDoubleTap,
    onMultiTap,
    maxTaps,
    multiTapDelay,
    onHoldStart,
    onHold,
    onHoldTick,
    onHoldProgress,
    onHoldEnd,
    onHoldCancel,
    holdDuration,
    holdTickInterval,
    onSwipe,
    swipeThreshold,
    swipeVelocity,
    moveTolerance,
    dispatchDomEvents,
    isDisabled,
    className,
    ...rest
  } = props;
  const { gestureProps, isPressed, isHolding, didHold } = useGesture({
    onSingleTap,
    onDoubleTap,
    onMultiTap,
    maxTaps,
    multiTapDelay,
    onHoldStart,
    onHold,
    onHoldTick,
    onHoldProgress,
    onHoldEnd,
    onHoldCancel,
    holdDuration,
    holdTickInterval,
    onSwipe,
    swipeThreshold,
    swipeVelocity,
    moveTolerance,
    dispatchDomEvents,
    isDisabled,
  });
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled || undefined}
      {...mergeProps(rest, gestureProps)}
      data-pressed={isPressed || undefined}
      data-holding={(isPressed && isHolding && !didHold) || undefined}
      data-held={didHold || undefined}
      className={cn('touch-manipulation select-none [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent]', focusRing, className)}
    />
  );
});
