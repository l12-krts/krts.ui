import type { ReactNode } from 'react';
import {
  Collection,
  Header,
  Keyboard,
  Menu as RACMenu,
  MenuItem as RACMenuItem,
  MenuSection as RACMenuSection,
  MenuTrigger as RACMenuTrigger,
  Separator,
  SubmenuTrigger as RACSubmenuTrigger,
  Text,
  type MenuItemProps as RACMenuItemProps,
  type MenuProps as RACMenuProps,
  type MenuSectionProps as RACMenuSectionProps,
  type MenuTriggerProps,
  type PopoverProps,
  type SubmenuTriggerProps,
} from 'react-aria-components';
import { cn, composeTw } from '../lib/cn';
import { CheckIcon, ChevronRightIcon } from './icons';
import { Popover } from './Popover';

export function MenuTrigger(props: MenuTriggerProps) {
  return <RACMenuTrigger {...props} />;
}

export function SubmenuTrigger(props: SubmenuTriggerProps) {
  return <RACSubmenuTrigger {...props} />;
}

export interface MenuProps<T> extends RACMenuProps<T> {
  placement?: PopoverProps['placement'];
  /** Set false when rendering a Menu inline (not in a popover). */
  withPopover?: boolean;
  popoverClassName?: string;
}

export function Menu<T extends object>({ placement = 'bottom start', withPopover = true, popoverClassName, className, ...props }: MenuProps<T>) {
  const menu = (
    <RACMenu
      {...props}
      className={composeTw(className, 'max-h-[inherit] min-w-[13rem] overflow-auto p-1.5 outline-none')}
    />
  );
  if (!withPopover) return menu;
  return (
    <Popover placement={placement} className={popoverClassName}>
      {menu}
    </Popover>
  );
}

export interface MenuItemProps<T> extends Omit<RACMenuItemProps<T>, 'children'> {
  children?: ReactNode;
  /** Secondary line under the label. */
  description?: ReactNode;
  /** Leading icon. */
  icon?: ReactNode;
  /** Keyboard shortcut shown on the right. */
  shortcut?: string;
  variant?: 'default' | 'danger';
}

export function MenuItem<T extends object>({ children, description, icon, shortcut, variant = 'default', className, ...props }: MenuItemProps<T>) {
  const textValue = props.textValue ?? (typeof children === 'string' ? children : undefined);
  return (
    <RACMenuItem
      textValue={textValue}
      {...props}
      className={composeTw(
        className,
        cn(
          // Hovered/focused items change instantly: menus are used too often to animate.
          'group relative flex min-h-9 cursor-default items-center gap-2.5 rounded-control px-2.5 py-1.5 text-[15px] outline-none select-none',
          'disabled:opacity-40',
          variant === 'danger'
            ? 'text-danger focus:bg-danger-soft'
            : 'text-fg focus:bg-surface-hover pressed:bg-surface-pressed',
        ),
      )}
    >
      {({ hasSubmenu, isSelected, selectionMode }) => (
        <>
          {selectionMode !== 'none' && (
            <span className="grid size-4 shrink-0 place-items-center">{isSelected && <CheckIcon size={14} />}</span>
          )}
          {icon && <span className="grid size-4 shrink-0 place-items-center text-fg-muted group-focus:text-current">{icon}</span>}
          <span className="flex min-w-0 flex-1 flex-col">
            <Text slot="label" className="truncate">
              {children}
            </Text>
            {description && (
              <Text slot="description" className="truncate text-[13px] text-fg-muted">
                {description}
              </Text>
            )}
          </span>
          {shortcut && <Keyboard className="font-sans text-[12px] tracking-wide text-fg-subtle">{shortcut}</Keyboard>}
          {hasSubmenu && <ChevronRightIcon size={14} className="text-fg-subtle" />}
        </>
      )}
    </RACMenuItem>
  );
}

export interface MenuSectionProps<T> extends RACMenuSectionProps<T> {
  title?: ReactNode;
}

export function MenuSection<T extends object>({ title, children, className, ...props }: MenuSectionProps<T>) {
  return (
    <RACMenuSection {...props} className={cn('flex flex-col', className as string)}>
      {title && <Header className="px-2.5 pt-2 pb-1 text-[12px] font-medium text-fg-subtle">{title}</Header>}
      <Collection items={props.items}>{children}</Collection>
    </RACMenuSection>
  );
}

export function MenuSeparator() {
  return <Separator className="mx-1 my-1.5 h-px bg-line-subtle" />;
}
