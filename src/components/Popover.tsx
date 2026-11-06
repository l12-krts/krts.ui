import { Popover as RACPopover, type PopoverProps as RACPopoverProps } from 'react-aria-components';
import { cn, composeTw } from '../lib/cn';

/** Shared floating-surface look (Figma "Dropdown menu": 12px radius). */
export const floatingSurface = cn(
  'rounded-menu border border-line-subtle bg-overlay text-fg shadow-float outline-none',
);

/**
 * Popovers grow out of their trigger (`--trigger-anchor-point`), never
 * from the centre and never from scale(0). Exit is quicker than enter.
 */
export const floatingMotion = cn(
  'origin-(--trigger-anchor-point) will-change-transform',
  'transition-[opacity,transform] duration-200 ease-out',
  'entering:opacity-0 entering:scale-[0.96]',
  'exiting:opacity-0 exiting:scale-[0.98] exiting:duration-120',
  'motion-reduce:entering:scale-100 motion-reduce:exiting:scale-100',
);

export interface PopoverProps extends RACPopoverProps {}

export function Popover({ className, offset = 6, ...props }: PopoverProps) {
  return (
    <RACPopover
      offset={offset}
      {...props}
      className={composeTw(className, cn(floatingSurface, floatingMotion, 'min-w-(--trigger-width)'))}
    />
  );
}
