import { AgentError, ATTR, norm, settle, waitFor, wholeWord } from './dom';
import {
  actionsOf,
  describe,
  describeAll,
  elementOf,
  readState,
  scan,
  store,
  subscribe,
  type Described,
} from './registry';
import type {
  KrtsAgentActResult,
  KrtsAgentApprovalRequest,
  KrtsAgentComponent,
  KrtsAgentEvent,
  KrtsAgentQuery,
  KrtsAgentQueryResult,
  KrtsAgentStep,
  KrtsAgentStepResult,
} from './types';

export interface KrtsAgentOptions {
  /**
   * Asked when a step needs a person's OK (a `confirm` mark, a HoldButton…).
   * Resolve `true` to let it run. Defaults to the mounted
   * `<KrtsAgentApprovals />`; with neither, those steps are refused.
   */
  allow?: (request: KrtsAgentApprovalRequest, ctx: { signal: AbortSignal }) => boolean | Promise<boolean>;
  /** How long to wait for a person's answer, ms. Default 5 minutes. */
  approvalTimeout?: number;
  /** Most components a snapshot lists. Default 100. */
  limit?: number;
  /**
   * Only see components inside this element (plus dialogs and menus opened
   * from it). Pass a function to look it up lazily. Default: the whole page.
   */
  root?: Element | null | (() => Element | null | undefined);
}

export interface KrtsAgent {
  /** What's on screen: every visible krts component with its state and actions. */
  snapshot(options?: { limit?: number }): KrtsAgentComponent[];
  /** Find components by text, kind or section, and page through long lists of choices. */
  query(input?: KrtsAgentQuery): KrtsAgentQueryResult;
  /** Run steps in order, stopping at the first failure. Calls are queued, never interleaved. */
  act(input: { steps: KrtsAgentStep[] }, options?: { signal?: AbortSignal }): Promise<KrtsAgentActResult>;
  /** Hear about changes, appearances and disappearances. Returns an unsubscribe function. */
  subscribe(listener: (event: KrtsAgentEvent) => void): () => void;
  /** Route a call to one of `krtsAgentTools` (by name) and return its JSON result. */
  callTool(name: string, input?: unknown): Promise<unknown>;
}

const MAX_STEPS = 50;
const PAGE = 50;

const fmt = (v: unknown) => (typeof v === 'string' ? `“${v}”` : JSON.stringify(v));

/** `press “Delete project”`, `set “Plan” to “Pro”`… */
export function summarize(step: { action: string; label: string; args: unknown[] }): string {
  const target = `“${step.label}”`;
  const args = step.args.map(fmt).join(', ');
  if (step.action === 'press' || step.action === 'confirm' || step.action === 'toggle') return `${step.action} ${target}`;
  const set = /^set([A-Z].*)$/.exec(step.action);
  if (set) return `set ${target} to ${args || 'nothing'}`;
  const words = step.action.replace(/([A-Z])/g, ' $1').toLowerCase();
  return `${words} ${target}${args ? ` (${args})` : ''}`;
}

const where = (d: KrtsAgentComponent) => `${d.ref} (${d.component} “${d.label}”${d.section ? ` in ${d.section}` : ''})`;

/** Resolve a ref, label, `"Section > Label"` or kind to exactly one component. */
function find(target: string, all: Described[]): Described {
  const byRef = all.find((d) => d.info.ref === target);
  if (byRef) return byRef;
  if (/^k\d+$/.test(target)) {
    throw new AgentError(
      store.entries.has(target)
        ? `${target} isn't visible right now (it may be in a closed section or behind a dialog).`
        : `${target} is gone. Take a new snapshot.`,
    );
  }

  const parts = target.split('>').map((s) => norm(s)).filter(Boolean);
  const name = parts.pop() ?? '';
  const pool = parts.length
    ? all.filter((d) => parts.every((p) => wholeWord(norm(d.info.section ?? ''), p) || norm(d.info.section ?? '') === p))
    : all;

  const tiers: ((d: Described) => boolean)[] = [
    (d) => norm(d.info.label) === name,
    (d) => wholeWord(norm(d.info.label), name),
    (d) => d.info.component === name,
  ];
  for (const tier of tiers) {
    const matches = pool.filter(tier);
    if (matches.length === 1) return matches[0]!;
    if (matches.length > 1) {
      throw new AgentError(
        `“${target}” matches ${matches.length} components: ${matches
          .slice(0, 8)
          .map((d) => where(d.info))
          .join(', ')}. Use a ref, or "Section > Label".`,
      );
    }
  }
  const close = all.filter((d) => name && norm(d.info.label).includes(name.slice(0, 4))).slice(0, 5);
  throw new AgentError(
    `Nothing called “${target}” is on screen.${close.length ? ` Similar: ${close.map((d) => where(d.info)).join(', ')}.` : ' Take a new snapshot.'}`,
  );
}

function validSteps(input: unknown): KrtsAgentStep[] | string {
  const steps = (input as { steps?: unknown } | null)?.steps;
  if (!Array.isArray(steps) || steps.length === 0) return 'Pass { steps: [{ ref, action, args? }, …] } with at least one step.';
  if (steps.length > MAX_STEPS) return `At most ${MAX_STEPS} steps per call.`;
  for (const [i, s] of steps.entries()) {
    const step = s as Partial<KrtsAgentStep> | null;
    if (!step || typeof step.ref !== 'string' || !step.ref.trim() || typeof step.action !== 'string' || !step.action.trim()) {
      return `Step ${i + 1} needs a string ref and a string action.`;
    }
    if (step.args !== undefined && !Array.isArray(step.args)) return `Step ${i + 1}: args must be a list, e.g. ["Pro"].`;
  }
  return steps as KrtsAgentStep[];
}

/**
 * The agent bridge. Reads the krts components on the page and drives them
 * through their own APIs, no screenshots or synthetic clicks needed.
 *
 * ```ts
 * const agent = createKrtsAgent();
 * agent.snapshot();
 * await agent.act({ steps: [{ ref: 'Wi-Fi', action: 'setChecked', args: [false] }] });
 * ```
 */
export function createKrtsAgent(options: KrtsAgentOptions = {}): KrtsAgent {
  const { approvalTimeout = 5 * 60_000, limit = 100 } = options;
  let queue: Promise<unknown> = Promise.resolve();

  /** Tests whether an element is inside `root`, or in a popup that a trigger inside `root` controls. */
  const scope = (): ((el: Element) => boolean) => {
    if (options.root === undefined) return () => true;
    const root = typeof options.root === 'function' ? options.root() : options.root;
    if (!root) return () => false;
    const popups = Array.from(root.querySelectorAll('[aria-controls]')).flatMap((t) =>
      (t.getAttribute('aria-controls') ?? '').split(/\s+/).map((id) => (id ? root.ownerDocument.getElementById(id) : null)),
    );
    return (el) => root.contains(el) || popups.some((p) => !!p?.contains(el));
  };

  /** Everything this agent may see. */
  const visible = (itemLimit = 20): Described[] => {
    const inScope = scope();
    return describeAll(itemLimit).filter((d) => inScope(d.el));
  };

  async function ask(req: KrtsAgentApprovalRequest, outer?: AbortSignal): Promise<string | undefined> {
    const approver = options.allow ?? store.approvers[store.approvers.length - 1];
    if (!approver) {
      return `This needs a person's OK (${req.confirm}), and nobody can be asked: the app has no approval UI.`;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), approvalTimeout);
    const onOuter = () => controller.abort();
    outer?.addEventListener('abort', onOuter);
    try {
      const answer = await Promise.race([
        Promise.resolve(approver(req, { signal: controller.signal })),
        new Promise<boolean>((r) => controller.signal.addEventListener('abort', () => r(false))),
      ]);
      if (answer === true) return undefined;
      return controller.signal.aborted ? 'Nobody answered in time, so this was not done.' : 'A person declined this step.';
    } catch {
      return 'The approval failed, so this was not done.';
    } finally {
      clearTimeout(timer);
      outer?.removeEventListener('abort', onOuter);
      controller.abort();
      // The approval dialog hides the page while open; wait for it to go.
      if (typeof document !== 'undefined') await waitFor(() => !document.querySelector(`[${ATTR.approval}]`), 1500);
    }
  }

  async function runStep(step: KrtsAgentStep, signal?: AbortSignal): Promise<KrtsAgentStepResult> {
    let target: Described;
    try {
      target = find(step.ref.trim(), visible(0));
    } catch (err) {
      return { ref: step.ref, component: '', label: '', action: step.action, ok: false, error: (err as Error).message };
    }
    const { entry, spec, el, info } = target;
    const base = { ref: info.ref, component: info.component, label: info.label, action: step.action };
    const fail = (error: string): KrtsAgentStepResult => ({ ...base, ok: false, error });

    if (info.disabled) return fail(`“${info.label}” is disabled.`);
    const action = actionsOf(spec, el)[step.action];
    if (!action) {
      return fail(`${info.component} “${info.label}” has no action “${step.action}”. Its actions: ${info.actions.join(', ') || 'none'}.`);
    }
    const args = step.args ?? [];

    if (info.confirm !== undefined && !action.safe) {
      const req: KrtsAgentApprovalRequest = { ...base, args, confirm: info.confirm, summary: summarize({ ...base, args }) };
      const refused = await ask(req, signal);
      if (refused) return fail(refused);
    }
    if (signal?.aborted) return fail('Cancelled.');

    const detail = { ...base, args };
    const allowed = el.dispatchEvent(new CustomEvent('krts:agentact', { detail, bubbles: true, cancelable: true }));
    if (!allowed) return fail('The app refused this step.');

    const before = readState(spec, el);
    // A new subscriber's baseline must predate this change.
    if (store.baselinePending) scan();
    store.touched.add(entry.ref);
    // While this is > 0, onChange handlers see isKrtsAgentActing() === true.
    store.acting++;
    try {
      await action.run(args, el);
    } catch (err) {
      store.touched.delete(entry.ref);
      return fail(err instanceof Error ? err.message : String(err));
    } finally {
      store.acting--;
    }
    await settle();

    // Read through the latest render, not the one we started from.
    const now = describe(entry, 0);
    scan();
    store.touched.delete(entry.ref);
    if (!now) return { ...base, ok: true };
    const after = readState(now.spec, now.el);
    const problem = actionsOf(now.spec, now.el)[step.action]?.verify?.(args, now.el);
    if (problem) return { ...fail(problem), state: after };
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      now.el.dispatchEvent(new CustomEvent('krts:agentchange', { detail: { ...detail, value: after, previous: before }, bubbles: true }));
    }
    return { ...base, ok: true, state: after };
  }

  async function act(input: { steps: KrtsAgentStep[] }, opts: { signal?: AbortSignal } = {}): Promise<KrtsAgentActResult> {
    const steps = validSteps(input);
    if (typeof steps === 'string') return { ok: false, error: steps, steps: [], appeared: [], gone: [] };

    const before = new Set(visible(0).map((d) => d.info.ref));
    const results: KrtsAgentStepResult[] = [];
    let error: string | undefined;
    for (const [i, step] of steps.entries()) {
      if (opts.signal?.aborted) {
        error = 'Cancelled.';
        break;
      }
      const r = await runStep(step, opts.signal);
      results.push(r);
      if (!r.ok) {
        error = `Step ${i + 1} (${step.action} on “${r.label || step.ref}”) failed: ${r.error}`;
        break;
      }
    }
    const after = visible();
    const result: KrtsAgentActResult = {
      ok: !error,
      steps: results,
      appeared: after.filter((d) => !before.has(d.info.ref)).slice(0, 30).map((d) => d.info),
      gone: [...before].filter((ref) => !after.some((d) => d.info.ref === ref)),
    };
    if (error) {
      result.error = error;
      const skipped = steps.length - results.length;
      if (skipped) result.skipped = skipped;
    }
    return result;
  }

  const agent: KrtsAgent = {
    snapshot(opts = {}) {
      return visible()
        .slice(0, opts.limit ?? limit)
        .map((d) => d.info);
    },

    query(input = {}) {
      const from = Math.max(0, Math.floor(Number(input.from) || 0));
      const text = input.text ? norm(input.text) : '';
      const within = input.within ? norm(input.within) : '';
      const all = visible(Infinity).filter((d) => {
        const i = d.info;
        if (input.kind && i.component !== input.kind) return false;
        if (within && !norm(i.section ?? '').includes(within)) return false;
        if (!text) return true;
        const hay = [i.label, i.description, i.section, i.hint].filter(Boolean).map((s) => norm(s!));
        return hay.some((h) => h.includes(text)) || !!i.items?.some((it) => norm(it.label).includes(text));
      });
      return {
        total: all.length,
        components: all.slice(0, PAGE).map((d) => describe(d.entry, PAGE, from)?.info ?? d.info),
      };
    },

    act(input, opts) {
      const run = queue.then(() => act(input, opts));
      queue = run.catch(() => {});
      return run;
    },

    subscribe(listener) {
      if (options.root === undefined) return subscribe(listener);
      // Only events about components in scope (and the disappearance of ones that were).
      const known = new Set<string>();
      return subscribe((e) => {
        if (e.type === 'disappear') {
          if (known.delete(e.ref)) listener(e);
          return;
        }
        const entry = store.entries.get(e.ref);
        const el = entry && elementOf(entry);
        if (el && scope()(el)) {
          known.add(e.ref);
          listener(e);
        }
      });
    },

    async callTool(name, input) {
      const args = (input ?? {}) as Record<string, unknown>;
      const page = typeof document !== 'undefined' ? document.title : '';
      switch (name) {
        case 'krts_snapshot': {
          const all = visible();
          return { page, components: all.slice(0, limit).map((d) => d.info), ...(all.length > limit && { truncated: all.length - limit }) };
        }
        case 'krts_query':
          return agent.query(args as KrtsAgentQuery);
        case 'krts_act':
          return agent.act(args as { steps: KrtsAgentStep[] });
        default:
          return { error: `Unknown tool “${name}”. Tools: krts_snapshot, krts_query, krts_act.` };
      }
    },
  };
  return agent;
}
