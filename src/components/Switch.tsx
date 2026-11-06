import type { ReactNode } from 'react';
import { Switch as RACSwitch, type SwitchProps as RACSwitchProps } from 'react-aria-components';
import { cn, composeTw } from '../lib/cn';

export interface SwitchProps extends Omit<RACSwitchProps, 'children'> {
  children?: ReactNode;
  size?: 'sm' | 'md';
}

/**
 * From the Figma "Toggle" frames — including the "halfway" frame, where
 * the thumb stretches while pressed and then settles on the other side.
 */
export function Switch({ children, size = 'md', className, ...props }: SwitchProps) {
  const md = size === 'md';
  return (
    <RACSwitch
      {...props}
      className={composeTw(
        className,
        'group flex items-center gap-2.5 text-base text-fg select-none disabled:opacity-50 [-webkit-tap-highlight-color:transparent]',
      )}
    >
      <span
        className={cn(
          'relative shrink-0 rounded-full border shadow-control',
          'transition-[background-color,border-color] duration-200 ease-out',
          'border-line bg-surface group-hover:border-line-strong',
          'group-selected:border-primary-line group-selected:bg-primary',
          'group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-focus',
          md ? 'h-8 w-16' : 'h-6 w-11',
        )}
      >
        <span
          className={cn(
            'absolute top-[1px] rounded-full bg-white group-selected:bg-primary-fg shadow-[0_0_1px_rgb(0_0_0/0.35),0_1px_3px_rgb(0_0_0/0.12)]',
            'transition-[left,width,background-color] duration-250 ease-out motion-reduce:transition-none',
            md
              ? 'left-[1px] size-7 group-pressed:w-9 group-selected:left-[calc(100%-29px)] group-selected:group-pressed:left-[calc(100%-37px)]'
              : 'left-[1px] size-5 group-pressed:w-6 group-selected:left-[calc(100%-21px)] group-selected:group-pressed:left-[calc(100%-25px)]',
          )}
        />
      </span>
      {children}
    </RACSwitch>
  );
}
