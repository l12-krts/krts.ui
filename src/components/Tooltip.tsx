import type { ReactNode } from 'react';
import {
  OverlayArrow,
  Tooltip as RACTooltip,
  TooltipTrigger as RACTooltipTrigger,
  type TooltipProps as RACTooltipProps,
  type TooltipTriggerComponentProps,
} from 'react-aria-components';
import { cn, composeTw } from '../lib/cn';

export interface TooltipProps extends Omit<RACTooltipProps, 'children'> {
  children: ReactNode;
  /** Small keyboard shortcut shown on the right, e.g. "⌘K". */
  shortcut?: ReactNode;
  showArrow?: boolean;
}

/**
 * Origin-aware tooltip. React Aria handles the warm-up: the first tooltip
 * waits, neighbours open instantly *and* skip their animation.
 */
export function Tooltip({ children, shortcut, showArrow = false, offset = 8, className, ...props }: TooltipProps) {
  return (
    <RACTooltip
      offset={offset}
      {...props}
      className={composeTw(
        className,
        cn(
          'group z-50 flex max-w-64 items-center gap-2 rounded-lg bg-primary px-2.5 py-1.5 text-[13px] leading-snug text-primary-fg shadow-float',
          'origin-(--trigger-anchor-point) will-change-transform',
          'transition-[opacity,transform] duration-125 ease-out',
          'entering:scale-[0.97] entering:opacity-0 exiting:scale-[0.97] exiting:opacity-0',
          'motion-reduce:entering:scale-100 motion-reduce:exiting:scale-100',
        ),
      )}
    >
      {showArrow && (
        <OverlayArrow>
          <svg width={8} height={8} viewBox="0 0 8 8" className="fill-primary group-placement-bottom:rotate-180 group-placement-left:-rotate-90 group-placement-right:rotate-90">
            <path d="M0 0 L4 4 L8 0" />
          </svg>
        </OverlayArrow>
      )}
      <span>{children}</span>
      {shortcut && (
        <kbd className="rounded border border-primary-fg/20 px-1 font-sans text-[11px] text-primary-fg/70">{shortcut}</kbd>
      )}
    </RACTooltip>
  );
}

export interface TooltipTriggerProps extends TooltipTriggerComponentProps {}

/** Wraps a focusable trigger and a `<Tooltip>`. Default delay 600ms. */
export function TooltipTrigger({ delay = 600, closeDelay = 300, ...props }: TooltipTriggerProps) {
  return <RACTooltipTrigger delay={delay} closeDelay={closeDelay} {...props} />;
}

/** One-liner: `<WithTooltip content="Save"><Button…/></WithTooltip>` */
export function WithTooltip({
  content,
  children,
  placement,
  shortcut,
  delay,
}: {
  content: ReactNode;
  children: React.ReactElement;
  placement?: RACTooltipProps['placement'];
  shortcut?: ReactNode;
  delay?: number;
}) {
  return (
    <TooltipTrigger delay={delay}>
      {children}
      <Tooltip placement={placement} shortcut={shortcut}>
        {content}
      </Tooltip>
    </TooltipTrigger>
  );
}

