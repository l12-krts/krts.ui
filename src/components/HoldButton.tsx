import { forwardRef, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button as RACButton, type ButtonProps as RACButtonProps } from 'react-aria-components';
import { mergeProps } from 'react-aria';
import { useAnimatedWidth } from '../hooks/useAnimatedWidth';
import { useGestureHandlers, type HoldGestureEvent } from '../hooks/useGesture';
import { cn, focusRing } from '../lib/cn';
import { dispatchKrtsEvent, KRTS_EVENTS } from '../lib/dom-events';
import { CheckIcon } from './icons';

export type HoldButtonVariant = 'danger' | 'primary' | 'secondary';

export interface HoldButtonProps
  extends Omit<RACButtonProps, 'children' | 'onPress' | 'onPressStart' | 'onPressEnd' | 'className' | 'style'> {
  children: ReactNode;
  /** Fires once the button has been held for `holdDuration`. */
  onConfirm: (e: HoldGestureEvent | { type: 'virtual' }) => void;
  /** How long to hold, ms. Default 2000. */
  holdDuration?: number;
  /** 0 → 1 while held (every frame). */
  onHoldProgress?: (progress: number) => void;
  /** Released before confirming. */
  onHoldCancel?: (e: HoldGestureEvent) => void;
  /** Shown briefly if someone taps instead of holding. */
  hint?: ReactNode;
  /** Shown after confirming. Pass `null` to keep the label. */
  confirmedContent?: ReactNode;
  /** How long the confirmed state is shown before resetting, ms. Default 1600. */
  resetAfter?: number;
  variant?: HoldButtonVariant;
  size?: 'sm' | 'md';
  /** Glide to the new width when the label swaps (hint / done). Default true. */
  animateWidth?: boolean;
  className?: string;
}

const fills: Record<HoldButtonVariant, string> = {
  danger: 'bg-danger text-danger-fg',
  primary: 'bg-primary text-primary-fg',
  secondary: 'bg-surface-pressed text-fg',
};
const bases: Record<HoldButtonVariant, string> = {
  danger: 'bg-surface border-line text-danger hover:bg-danger-soft',
  primary: 'bg-surface border-line text-fg hover:bg-surface-hover',
  secondary: 'bg-surface border-line text-fg hover:bg-surface-hover',
};

/**
 * Hold-to-confirm button — a calmer alternative to an "Are you sure?"
 * dialog for destructive actions.
 *
 * Holding fills the button left→right (linear, deliberate). Letting go
 * snaps back fast (ease-out). Works with a mouse, touch, and by holding
 * Space/Enter. Screen-reader activation confirms immediately, since a
 * virtual click can't be held.
 */
export const HoldButton = forwardRef<HTMLButtonElement, HoldButtonProps>(function HoldButton(
  {
    children,
    onConfirm,
    holdDuration = 2000,
    onHoldProgress,
    onHoldCancel,
    hint = 'Hold to confirm',
    confirmedContent,
    resetAfter = 1600,
    variant = 'danger',
    size = 'md',
    className,
    isDisabled,
    animateWidth = true,
    ...rest
  },
  ref,
) {
  const [phase, setPhase] = useState<'idle' | 'holding' | 'hint' | 'confirmed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hintId = useId();

  useEffect(() => () => clearTimeout(timer.current), []);

  const settle = (next: 'hint' | 'confirmed', ms: number) => {
    setPhase(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPhase('idle'), ms);
  };

  const { pressHandlers, pointerProps } = useGestureHandlers({
    holdDuration,
    isDisabled: isDisabled || phase === 'confirmed',
    onHoldStart: (e) => {
      if (e.pointerType === 'virtual') return;
      clearTimeout(timer.current);
      setPhase('holding');
    },
    onHold: (e) => {
      settle('confirmed', resetAfter);
      dispatchKrtsEvent(e.target, KRTS_EVENTS.confirm, e);
      onConfirm(e);
    },
    onHoldCancel: (e) => {
      onHoldCancel?.(e);
      // A quick tap means they didn't know to hold: tell them.
      if (e.duration < 350 && hint) settle('hint', 1400);
      else setPhase('idle');
    },
    onHoldProgress,
  });

  const onPress = (e: Parameters<NonNullable<RACButtonProps['onPress']>>[0]) => {
    if (e.pointerType === 'virtual' && phase !== 'confirmed') {
      settle('confirmed', resetAfter);
      onConfirm({ type: 'virtual' });
    }
  };

  const { contentRef, widthStyle, widthTransition } = useAnimatedWidth({ enabled: animateWidth });

  const holding = phase === 'holding';
  const confirmed = phase === 'confirmed';
  const label = phase === 'hint' ? hint : confirmed && confirmedContent !== null ? (confirmedContent ?? <><CheckIcon size={16} /> Done</>) : children;

  const content = (
    <span key={phase === 'hint' ? 'hint' : confirmed ? 'done' : 'label'} className="inline-flex items-center gap-2 transition-[opacity,filter] duration-200 ease-out starting:opacity-0 starting:blur-[2px]">
      {label}
    </span>
  );

  return (
    <RACButton
      {...(mergeProps(rest, pressHandlers, pointerProps, { onPress }) as RACButtonProps)}
      ref={ref}
      isDisabled={isDisabled}
      aria-describedby={hintId}
      data-holding={holding || undefined}
      data-confirmed={confirmed || undefined}
      className={cn(
        'group/hold relative isolate inline-flex select-none items-center justify-center overflow-hidden whitespace-nowrap rounded-control border font-sans leading-none shadow-control',
        'cursor-default touch-manipulation [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]',
        'transition-[background-color,border-color,color] duration-150 ease-out',
        'disabled:cursor-not-allowed disabled:opacity-45',
        focusRing,
        size === 'md' ? 'h-12 px-[18px] text-base' : 'h-9 px-3.5 text-sm',
        animateWidth && 'shrink-0',
        bases[variant],
        className,
      )}
      style={{
        ...widthStyle,
        ...(widthTransition
          ? { transition: `background-color 150ms var(--ease-out), border-color 150ms var(--ease-out), color 150ms var(--ease-out), ${widthTransition}` }
          : null),
      }}
    >
      <span ref={contentRef} className="relative inline-flex shrink-0 items-center gap-2">
        {content}
      </span>
      {/* The fill: a clipped copy of the label so the text colour flips exactly at the edge. */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 flex items-center justify-center',
          fills[variant],
          // Release: snap back fast. Press: slow, linear, deliberate.
          '[clip-path:inset(0_100%_0_0)] [transition:clip-path_200ms_var(--ease-out)]',
          'group-data-[holding]/hold:[clip-path:inset(0_0_0_0)] group-data-[holding]/hold:[transition:clip-path_var(--hold-ms)_linear]',
          'group-data-[confirmed]/hold:[clip-path:inset(0_0_0_0)]',
        )}
        style={{ '--hold-ms': `${holdDuration}ms` } as React.CSSProperties}
      >
        <span className="inline-flex items-center gap-2">{content}</span>
      </span>
      <span id={hintId} className="sr-only">
        Press and hold for {Math.round(holdDuration / 100) / 10} seconds to confirm.
      </span>
    </RACButton>
  );
});
