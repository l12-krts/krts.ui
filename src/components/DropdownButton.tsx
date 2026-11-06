import type { ReactNode } from 'react';
import type { MenuProps as RACMenuProps, PopoverProps } from 'react-aria-components';
import { cn } from '../lib/cn';
import type { OverlayAnimation } from '../lib/config';
import { Button, type ButtonProps } from './Button';
import { ChevronDownIcon } from './icons';
import { Menu, MenuTrigger } from './Menu';

export interface DropdownButtonProps<T> extends Omit<RACMenuProps<T>, 'children' | 'className'> {
  /** Button label. */
  label: ReactNode;
  /** Menu items (`<MenuItem>`s or a render function). */
  children: RACMenuProps<T>['children'];
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  isDisabled?: boolean;
  placement?: PopoverProps['placement'];
  /** Menu animation: `'fade'` (default), `'scale'` or `'none'`. */
  animation?: OverlayAnimation;
  className?: string;
}

/**
 * The Figma "Dropdown Button": label │ divider │ chevron, opening a menu.
 * The chevron flips while the menu is open.
 */
export function DropdownButton<T extends object>({
  label,
  children,
  variant = 'primary',
  size = 'md',
  isDisabled,
  placement = 'bottom start',
  className,
  ...menuProps
}: DropdownButtonProps<T>) {
  const divider = variant === 'primary' ? 'bg-primary-line' : variant === 'danger' ? 'bg-danger-line' : 'bg-line';
  return (
    <MenuTrigger>
      <Button variant={variant} size={size} isDisabled={isDisabled} className={cn('group gap-0 pr-0', size === 'md' ? 'pl-6' : 'pl-3.5', className)}>
        <span>{label}</span>
        <span aria-hidden className={cn('w-px self-stretch', size === 'md' ? 'ml-3' : 'ml-2.5', divider)} />
        <span className={cn('grid place-items-center', size === 'md' ? 'w-11' : size === 'sm' ? 'w-9' : 'w-7')}>
          <ChevronDownIcon
            size={size === 'md' ? 20 : 16}
            className="transition-transform duration-200 ease-out group-aria-expanded:rotate-180"
          />
        </span>
      </Button>
      <Menu placement={placement} {...menuProps}>
        {children}
      </Menu>
    </MenuTrigger>
  );
}

export interface SplitButtonProps<T> extends DropdownButtonProps<T> {
  /** Main action when the label half is pressed. */
  onAction?: () => void;
  onMenuAction?: RACMenuProps<T>['onAction'];
  /** Accessible label for the chevron half. */
  menuLabel?: string;
}

/** A main action and a menu of related actions, joined. */
export function SplitButton<T extends object>({
  label,
  children,
  variant = 'primary',
  size = 'md',
  isDisabled,
  placement = 'bottom end',
  onAction,
  onMenuAction,
  menuLabel = 'More options',
  className,
  ...menuProps
}: SplitButtonProps<T>) {
  return (
    <div className={cn('inline-flex', className)} role="group">
      <Button variant={variant} size={size} isDisabled={isDisabled} onPress={onAction} className="rounded-r-none border-r-0">
        {label}
      </Button>
      <MenuTrigger>
        <Button
          variant={variant}
          size={size}
          isDisabled={isDisabled}
          isIconOnly
          aria-label={menuLabel}
          className={cn(
            'group rounded-l-none',
            variant === 'primary' ? 'border-l-primary-line' : variant === 'danger' ? 'border-l-danger-line' : 'border-l-line',
          )}
        >
          <ChevronDownIcon size={size === 'md' ? 20 : 16} className="transition-transform duration-200 ease-out group-aria-expanded:rotate-180" />
        </Button>
        <Menu placement={placement} onAction={onMenuAction} {...menuProps}>
          {children}
        </Menu>
      </MenuTrigger>
    </div>
  );
}
