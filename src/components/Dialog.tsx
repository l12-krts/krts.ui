import type { ReactNode } from 'react';
import {
  Dialog as RACDialog,
  DialogTrigger as RACDialogTrigger,
  Heading,
  Modal as RACModal,
  ModalOverlay,
  type DialogProps as RACDialogProps,
  type DialogTriggerProps,
  type ModalOverlayProps,
} from 'react-aria-components';
import { cn, composeTw } from '../lib/cn';
import { Button } from './Button';
import { XIcon } from './icons';

export function DialogTrigger(props: DialogTriggerProps) {
  return <RACDialogTrigger {...props} />;
}

const overlayMotion = cn(
  'fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px]',
  'transition-opacity duration-200 ease-out entering:opacity-0 exiting:opacity-0 exiting:duration-150',
);

export interface ModalProps extends ModalOverlayProps {
  size?: 'sm' | 'md' | 'lg';
}

/** Modals stay centred (they aren't anchored to a trigger). */
export function Modal({ size = 'md', className, children, ...props }: ModalProps) {
  return (
    <ModalOverlay {...props} className={overlayMotion}>
      <div className="flex min-h-full items-center justify-center p-4">
        <RACModal
          className={composeTw(
            className,
            cn(
              'w-full rounded-[16px] border border-line-subtle bg-bg text-fg shadow-float outline-none',
              'transition-[opacity,transform] duration-250 ease-out',
              'entering:translate-y-2 entering:scale-[0.97] entering:opacity-0',
              'exiting:scale-[0.98] exiting:opacity-0 exiting:duration-150',
              'motion-reduce:entering:translate-y-0 motion-reduce:entering:scale-100 motion-reduce:exiting:scale-100',
              size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-md',
            ),
          )}
        >
          {children}
        </RACModal>
      </div>
    </ModalOverlay>
  );
}

export interface DialogProps extends Omit<RACDialogProps, 'children'> {
  title?: ReactNode;
  description?: ReactNode;
  children?: RACDialogProps['children'];
  /** Footer actions. Receives `close`. */
  footer?: (close: () => void) => ReactNode;
  showClose?: boolean;
}

export function Dialog({ title, description, children, footer, showClose = true, className, ...props }: DialogProps) {
  return (
    <RACDialog {...props} className={cn('relative flex flex-col gap-4 p-6 outline-none', className)}>
      {(rp) => (
        <>
          {(title || description) && (
            <div className="flex flex-col gap-1.5 pr-8">
              {title && (
                <Heading slot="title" className="text-lg font-semibold leading-tight text-fg">
                  {title}
                </Heading>
              )}
              {description && <p className="text-[15px] leading-relaxed text-fg-muted">{description}</p>}
            </div>
          )}
          {typeof children === 'function' ? children(rp) : children}
          {footer && <div className="mt-2 flex flex-wrap justify-end gap-2">{footer(rp.close)}</div>}
          {showClose && (
            <Button
              variant="ghost"
              size="xs"
              isIconOnly
              aria-label="Close"
              onPress={rp.close}
              className="absolute top-4 right-4"
            >
              <XIcon size={16} />
            </Button>
          )}
        </>
      )}
    </RACDialog>
  );
}

export interface AlertDialogProps extends Omit<DialogProps, 'footer' | 'role'> {
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  variant?: 'primary' | 'danger';
  onConfirm?: () => void | Promise<void>;
}

export function AlertDialog({
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  ...props
}: AlertDialogProps) {
  return (
    <Dialog
      role="alertdialog"
      showClose={false}
      {...props}
      footer={(close) => (
        <>
          <Button size="sm" variant="secondary" onPress={close}>
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            variant={variant}
            autoFocus
            onPress={async () => {
              await onConfirm?.();
              close();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      )}
    />
  );
}

export interface DrawerProps extends Omit<ModalOverlayProps, 'children'> {
  side?: 'right' | 'left' | 'bottom';
}

/**
 * A panel that slides in from an edge. Uses translate percentages so it
 * works at any size, with the iOS-like drawer curve.
 */
export function Drawer({ side = 'right', className, children, ...props }: DrawerProps & { children?: ReactNode }) {
  const pos =
    side === 'bottom'
      ? 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-[20px] entering:translate-y-full exiting:translate-y-full'
      : side === 'left'
        ? 'inset-y-0 left-0 w-[min(24rem,90vw)] entering:-translate-x-full exiting:-translate-x-full'
        : 'inset-y-0 right-0 w-[min(24rem,90vw)] entering:translate-x-full exiting:translate-x-full';
  return (
    <ModalOverlay {...props} className={overlayMotion}>
      <RACModal
        className={composeTw(
          className,
          cn(
            'fixed flex flex-col overflow-auto border-line-subtle bg-bg text-fg shadow-float outline-none',
            'transition-transform duration-400 ease-drawer exiting:duration-250',
            'motion-reduce:transition-opacity motion-reduce:entering:translate-0 motion-reduce:exiting:translate-0 motion-reduce:entering:opacity-0',
            side === 'bottom' ? 'border-t' : side === 'left' ? 'border-r' : 'border-l',
            pos,
          ),
        )}
      >
        {side === 'bottom' && <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-line" />}
        {children}
      </RACModal>
    </ModalOverlay>
  );
}
