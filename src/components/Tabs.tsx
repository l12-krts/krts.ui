import type { ReactNode } from 'react';
import {
  SelectionIndicator,
  Tab as RACTab,
  TabList as RACTabList,
  TabPanel as RACTabPanel,
  Tabs as RACTabs,
  type TabListProps,
  type TabPanelProps,
  type TabProps as RACTabProps,
  type TabsProps as RACTabsProps,
} from 'react-aria-components';
import { cn, composeTw } from '../lib/cn';

type TabsVariant = 'pill' | 'underline';

export interface TabsProps extends RACTabsProps {}

export function Tabs({ className, ...props }: TabsProps) {
  return <RACTabs {...props} className={composeTw(className, 'flex gap-4 orientation-horizontal:flex-col')} />;
}

export function TabList<T extends object>({ variant = 'pill', className, ...props }: TabListProps<T> & { variant?: TabsVariant }) {
  return (
    <RACTabList
      {...props}
      data-variant={variant}
      className={composeTw(
        className,
        cn(
          'group/tablist relative flex',
          variant === 'pill'
            ? 'w-fit gap-0.5 rounded-[10px] border border-line bg-surface p-[3px] shadow-control'
            : 'gap-5 border-b border-line-subtle',
        ),
      )}
    />
  );
}

export interface TabProps extends Omit<RACTabProps, 'children'> {
  children?: ReactNode;
}

/**
 * The selection indicator glides between tabs (shared-element transition);
 * text colour changes in sync with it.
 */
export function Tab({ children, className, ...props }: TabProps) {
  return (
    <RACTab
      {...props}
      className={composeTw(
        className,
        cn(
          'group relative flex cursor-default items-center justify-center gap-2 text-[15px] whitespace-nowrap outline-none select-none',
          'text-fg-muted transition-colors duration-200 ease-out hover:text-fg selected:text-fg disabled:opacity-40',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
          'group-data-[variant=pill]/tablist:h-9 group-data-[variant=pill]/tablist:rounded-[7px] group-data-[variant=pill]/tablist:px-3.5',
          'group-data-[variant=underline]/tablist:h-10 group-data-[variant=underline]/tablist:px-0.5',
        ),
      )}
    >
      <SelectionIndicator
        className={cn(
          'absolute -z-0 transition-[translate,width,height] duration-250 ease-out motion-reduce:transition-none',
          'group-data-[variant=pill]/tablist:inset-0 group-data-[variant=pill]/tablist:rounded-[7px] group-data-[variant=pill]/tablist:bg-bg group-data-[variant=pill]/tablist:shadow-control',
          'group-data-[variant=underline]/tablist:inset-x-0 group-data-[variant=underline]/tablist:-bottom-px group-data-[variant=underline]/tablist:h-0.5 group-data-[variant=underline]/tablist:bg-primary',
        )}
      />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </RACTab>
  );
}

export function TabPanel({ className, ...props }: TabPanelProps) {
  return (
    <RACTabPanel
      {...props}
      className={composeTw(
        className,
        'rounded-control outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
      )}
    />
  );
}
