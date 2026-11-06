import type { ReactNode } from 'react';
import {
  Button as RACButton,
  Disclosure as RACDisclosure,
  DisclosureGroup,
  DisclosurePanel,
  Heading,
  type DisclosureGroupProps,
  type DisclosureProps as RACDisclosureProps,
} from 'react-aria-components';
import { cn, composeTw } from '../lib/cn';
import { ChevronDownIcon } from './icons';

export interface DisclosureProps extends Omit<RACDisclosureProps, 'children'> {
  title: ReactNode;
  children: ReactNode;
}

/**
 * Expandable section. Height animates via `--disclosure-panel-height`
 * which React Aria measures for us.
 */
export function Disclosure({ title, children, className, ...props }: DisclosureProps) {
  return (
    <RACDisclosure {...props} className={composeTw(className, 'group border-b border-line-subtle')}>
      <Heading className="m-0">
        <RACButton
          slot="trigger"
          className={cn(
            'flex w-full items-center justify-between gap-4 py-3.5 text-left text-[15px] font-medium text-fg outline-none',
            'rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
          )}
        >
          {title}
          <ChevronDownIcon size={18} className="shrink-0 text-fg-muted transition-transform duration-250 ease-out group-expanded:rotate-180" />
        </RACButton>
      </Heading>
      <DisclosurePanel
        className={cn(
          'h-(--disclosure-panel-height) overflow-clip motion-safe:transition-[height] duration-250 ease-out',
        )}
      >
        <div className="pb-4 text-[15px] leading-relaxed text-fg-muted opacity-0 transition-opacity duration-200 ease-out group-expanded:opacity-100">
          {children}
        </div>
      </DisclosurePanel>
    </RACDisclosure>
  );
}

export function Accordion({ className, ...props }: DisclosureGroupProps) {
  return <DisclosureGroup {...props} className={composeTw(className, 'flex flex-col border-t border-line-subtle')} />;
}
