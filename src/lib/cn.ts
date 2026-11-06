import { clsx, type ClassValue } from 'clsx';
import { composeRenderProps } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

/** Merge class names, letting later Tailwind utilities win over earlier ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Merge a component's base classes with a React Aria `className` prop,
 * which may be a string or a render-prop function of the component state.
 */
export function composeTw<T>(
  className: string | ((v: T) => string) | undefined,
  tw: string | ((v: T) => string),
): string | ((v: T) => string) {
  return composeRenderProps(className, (cls, state) =>
    cn(typeof tw === 'function' ? tw(state) : tw, cls),
  );
}

/** Focus ring shared by every interactive control. */
export const focusRing =
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

/** Press feedback: buttons must feel like they heard you. */
export const pressScale =
  'transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out pressed:scale-[0.97] motion-reduce:pressed:scale-100';
