import { forwardRef, type ReactNode } from 'react';
import { Button as RACButton, type ButtonProps as RACButtonProps, composeRenderProps } from 'react-aria-components';
import { mergeProps } from 'react-aria';
import { useGestureHandlers, type GestureOptions } from '../hooks/useGesture';
import { useSmoothPending } from '../hooks/usePerceived';
import { useAnimatedWidth } from '../hooks/useAnimatedWidth';
import { cn, focusRing } from '../lib/cn';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary border-primary-line text-primary-fg hover:bg-primary-hover pressed:bg-primary-pressed shadow-control',
  secondary:
    'bg-surface border-line text-fg hover:bg-surface-hover pressed:bg-surface-pressed pressed:border-line-strong shadow-control',
  danger:
    'bg-danger border-danger-line text-danger-fg hover:bg-danger-hover pressed:bg-danger-pressed shadow-control',
  ghost:
    'bg-transparent border-transparent text-fg/80 hover:bg-surface/70 hover:text-fg pressed:bg-surface-pressed/60 pressed:text-fg',
};

const sizes: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-[13px] gap-1.5 rounded-[6px]',
  sm: 'h-9 px-3.5 text-sm gap-2',
  md: 'h-12 px-[18px] text-base gap-2.5',
};
const iconSizes: Record<ButtonSize, string> = { xs: 'size-7 px-0', sm: 'size-9 px-0', md: 'size-12 px-0' };

export function buttonStyles({
  variant = 'secondary',
  size = 'md',
  isIconOnly = false,
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; isIconOnly?: boolean; className?: string } = {}) {
  return cn(
    'group/button relative isolate inline-flex select-none items-center justify-center whitespace-nowrap rounded-control border font-sans font-normal leading-none',
    'cursor-default [-webkit-tap-highlight-color:transparent] touch-manipulation',
    // Press feedback comes from the pressed colours (Figma "Pressed" row) — no scaling.
    'transition-[background-color,border-color,color,box-shadow,opacity] duration-150 ease-out',
    'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none',
    focusRing,
    variants[variant],
    sizes[size],
    isIconOnly && iconSizes[size],
    className,
  );
}

type GestureProps = Pick<
  GestureOptions,
  | 'onSingleTap'
  | 'onDoubleTap'
  | 'onMultiTap'
  | 'maxTaps'
  | 'multiTapDelay'
  | 'onHoldStart'
  | 'onHold'
  | 'onHoldTick'
  | 'onHoldProgress'
  | 'onHoldEnd'
  | 'onHoldCancel'
  | 'holdDuration'
  | 'holdTickInterval'
  | 'onSwipe'
>;

const gestureKeys: (keyof GestureProps)[] = [
  'onSingleTap',
  'onDoubleTap',
  'onMultiTap',
  'onHoldStart',
  'onHold',
  'onHoldTick',
  'onHoldProgress',
  'onHoldEnd',
  'onHoldCancel',
  'onSwipe',
];

export interface ButtonProps extends Omit<RACButtonProps, 'children'>, GestureProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Square button for a lone icon. Remember an `aria-label`. */
  isIconOnly?: boolean;
  children?: RACButtonProps['children'];
  /** Shown before the label. */
  startContent?: ReactNode;
  /** Shown after the label. */
  endContent?: ReactNode;
  /**
   * When the label changes ("Save" → "Saved"), glide to the new width with
   * an ease-out curve instead of jumping. Default true (off for icon-only).
   * Turn off if you size the button yourself (e.g. `w-full`).
   */
  animateWidth?: boolean;
}

const BASE_TRANSITION =
  'background-color 150ms var(--ease-out), border-color 150ms var(--ease-out), color 150ms var(--ease-out), box-shadow 150ms var(--ease-out), opacity 150ms var(--ease-out)';

/**
 * The krts.ui button. Accepts every React Aria `Button` prop plus gesture
 * events: `onSingleTap`, `onDoubleTap`, `onMultiTap`, `onHold`,
 * `onHoldTick`, `onSwipe`…
 *
 * `isPending` shows a spinner only if the work takes longer than 150ms,
 * and then keeps it for at least 500ms — no flicker.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const {
    variant = 'secondary',
    size = 'md',
    isIconOnly,
    className,
    children,
    startContent,
    endContent,
    isPending,
    maxTaps,
    multiTapDelay,
    holdDuration,
    holdTickInterval,
    animateWidth = !isIconOnly,
    style,
    ...rest
  } = props;

  const gestureOpts: GestureOptions = { maxTaps, multiTapDelay, holdDuration, holdTickInterval };
  const racProps: Record<string, unknown> = {};
  let hasGestures = false;
  for (const [k, v] of Object.entries(rest)) {
    if ((gestureKeys as string[]).includes(k)) {
      (gestureOpts as Record<string, unknown>)[k] = v;
      if (v) hasGestures = true;
    } else racProps[k] = v;
  }
  gestureOpts.isDisabled = !!props.isDisabled || !!isPending;

  const { pressHandlers, pointerProps } = useGestureHandlers(gestureOpts);
  const showSpinner = useSmoothPending(!!isPending);

  const { contentRef, widthStyle, widthTransition } = useAnimatedWidth({ enabled: animateWidth });

  const merged = hasGestures ? mergeProps(racProps, pressHandlers, pointerProps) : racProps;

  return (
    <RACButton
      {...(merged as RACButtonProps)}
      ref={ref}
      isPending={isPending}
      data-spinner={showSpinner || undefined}
      className={composeRenderProps(className, (cls) =>
        buttonStyles({ variant, size, isIconOnly, className: cn(animateWidth && 'shrink-0 overflow-hidden', cls) }),
      )}
      style={composeRenderProps(style, (s) => ({
        ...widthStyle,
        ...(widthTransition ? { transition: `${BASE_TRANSITION}, ${widthTransition}` } : null),
        ...s,
      }))}
    >
      {composeRenderProps(children, (child) => (
        <>
          <span
            ref={contentRef}
            className={cn(
              'inline-flex shrink-0 items-center justify-center gap-[inherit] self-stretch transition-[opacity,filter] duration-200 ease-out',
              showSpinner && 'opacity-0 blur-[2px]',
            )}
          >
            {startContent}
            {child}
            {endContent}
          </span>
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-0 flex items-center justify-center transition-[opacity,filter] duration-200 ease-out',
              showSpinner ? 'opacity-100 blur-0' : 'opacity-0 blur-[2px]',
            )}
          >
            {showSpinner && <Spinner size={size === 'md' ? 18 : 14} />}
          </span>
        </>
      ))}
    </RACButton>
  );
});
