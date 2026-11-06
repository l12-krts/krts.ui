import type { ReactNode } from 'react';
import {
  SelectionIndicator,
  ToggleButton as RACToggleButton,
  ToggleButtonGroup as RACToggleButtonGroup,
  type ToggleButtonGroupProps,
  type ToggleButtonProps as RACToggleButtonProps,
} from 'react-aria-components';
import { cn, composeTw } from '../lib/cn';
import { buttonStyles, type ButtonSize } from './Button';

export interface ToggleButtonProps extends Omit<RACToggleButtonProps, 'children'> {
  children?: ReactNode;
  size?: ButtonSize;
  isIconOnly?: boolean;
}

/** A button that stays pressed. Selected state uses the primary fill. */
export function ToggleButton({ size = 'sm', isIconOnly, className, ...props }: ToggleButtonProps) {
  return (
    <RACToggleButton
      {...props}
      className={composeTw(className, (rp: { isSelected: boolean }) =>
        buttonStyles({
          variant: rp.isSelected ? 'primary' : 'secondary',
          size,
          isIconOnly,
        }),
      )}
    />
  );
}

export interface SegmentedControlProps extends Omit<ToggleButtonGroupProps, 'children'> {
  children: ReactNode;
  size?: 'sm' | 'md';
}

/**
 * iOS-style segmented control. Single selection by default; the thumb
 * slides between segments.
 */
export function SegmentedControl({ size = 'sm', className, selectionMode = 'single', disallowEmptySelection = true, ...props }: SegmentedControlProps) {
  return (
    <RACToggleButtonGroup
      {...props}
      selectionMode={selectionMode}
      disallowEmptySelection={disallowEmptySelection}
      data-size={size}
      className={composeTw(
        className,
        'group/seg inline-flex w-fit gap-0.5 rounded-[10px] border border-line bg-surface p-[3px] shadow-control',
      )}
    />
  );
}

export function Segment({ children, className, ...props }: Omit<RACToggleButtonProps, 'children'> & { children?: ReactNode }) {
  return (
    <RACToggleButton
      {...props}
      className={composeTw(
        className,
        cn(
          'relative inline-flex cursor-default items-center justify-center gap-2 rounded-[7px] px-3.5 whitespace-nowrap outline-none select-none',
          'text-fg-muted transition-[color,transform] duration-200 ease-out hover:text-fg selected:text-fg pressed:scale-[0.97] disabled:opacity-40',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
          'h-8 text-[14px] group-data-[size=md]/seg:h-10 group-data-[size=md]/seg:text-[15px]',
        ),
      )}
    >
      <SelectionIndicator className="absolute inset-0 rounded-[7px] bg-bg shadow-control transition-[translate,width] duration-250 ease-out motion-reduce:transition-none" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </RACToggleButton>
  );
}
