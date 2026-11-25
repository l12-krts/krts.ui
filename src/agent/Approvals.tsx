import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../components/Button';
import { Dialog, Modal } from '../components/Dialog';
import { ATTR } from './dom';
import { addApprover } from './registry';
import type { KrtsAgentApprovalRequest } from './types';

interface Pending {
  req: KrtsAgentApprovalRequest;
  resolve: (ok: boolean) => void;
}

export interface KrtsAgentApprovalsProps {
  /** Default: "Allow the agent to do this?" */
  title?: ReactNode;
  /** Default: "Allow" */
  allowLabel?: ReactNode;
  /** Default: "Deny" */
  denyLabel?: ReactNode;
}

/**
 * Asks a person whenever an agent step needs approval: components marked
 * `confirm`, and every HoldButton. Render it once, anywhere in the app.
 *
 * Agents can't see or press it. Escape, clicking outside, or no answer
 * within the agent's `approvalTimeout` all count as "Deny".
 */
export function KrtsAgentApprovals({
  title = 'Allow the agent to do this?',
  allowLabel = 'Allow',
  denyLabel = 'Deny',
}: KrtsAgentApprovalsProps) {
  const [queue, setQueue] = useState<Pending[]>([]);

  useEffect(
    () =>
      addApprover(
        (req, { signal }) =>
          new Promise<boolean>((resolve) => {
            const item: Pending = { req, resolve };
            signal.addEventListener('abort', () => {
              resolve(false);
              setQueue((q) => q.filter((p) => p !== item));
            });
            setQueue((q) => [...q, item]);
          }),
      ),
    [],
  );

  const current = queue[0];
  // Keep showing the last request while the dialog animates out.
  const shown = useRef<KrtsAgentApprovalRequest | undefined>(undefined);
  if (current) shown.current = current.req;
  const req = shown.current;

  const decide = (ok: boolean) => {
    if (!current) return;
    current.resolve(ok);
    setQueue((q) => q.filter((p) => p !== current));
  };

  return (
    <Modal
      size="sm"
      isOpen={!!current}
      isDismissable
      onOpenChange={(open) => {
        if (!open) decide(false);
      }}
    >
      {req && (
        <Dialog
          role="alertdialog"
          title={title}
          showClose={false}
          agent={{ hidden: true }}
          {...{ [ATTR.approval]: '' }}
          footer={() => (
            <>
              <Button size="sm" variant="secondary" autoFocus onPress={() => decide(false)}>
                {denyLabel}
              </Button>
              <Button size="sm" variant="primary" onPress={() => decide(true)}>
                {allowLabel}
              </Button>
            </>
          )}
        >
          <p className="text-[15px] leading-relaxed text-fg">
            An agent wants to <strong className="font-semibold">{req.summary}</strong>.
          </p>
          {req.confirm && (
            <p className="rounded-control border border-line-subtle bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-fg-muted">
              {req.confirm}
            </p>
          )}
        </Dialog>
      )}
    </Modal>
  );
}
