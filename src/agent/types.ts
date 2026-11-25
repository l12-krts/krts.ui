/**
 * What an app tells agents about one krts component, via its `agent` prop.
 *
 * ```tsx
 * <Button agent={{ confirm: 'Deletes the project' }}>Delete</Button>
 * <TextField label="API key" agent={{ secret: true }} />
 * <Switch agent={{ hidden: true }}>Debug mode</Switch>
 * ```
 *
 * Plain elements can use the same marks as data attributes:
 * `data-krts-agent-hidden`, `data-krts-agent-secret`,
 * `data-krts-agent-confirm="…"`. They apply to everything inside.
 */
export interface KrtsAgentMark {
  /** Leave this component, and anything inside it, out of what agents see. */
  hidden?: boolean;
  /** Agents see `"[redacted]"` instead of the value. They can still type into it. */
  secret?: boolean;
  /**
   * A person must approve any change an agent makes here. Pass a short
   * description of what happens (`"Deletes the project"`) or `true`.
   */
  confirm?: string | boolean;
  /** The name agents see and use, if it should differ from the visible label. */
  label?: string;
  /** Extra context for agents, e.g. what the control affects. */
  description?: string;
}

/** Mixed into every krts component's props. */
export interface KrtsAgentProps {
  /** How agents see this component. See `KrtsAgentMark`. */
  agent?: KrtsAgentMark;
}

/** One choice in a select, radio group, tab list, menu… */
export interface KrtsAgentItem {
  /** Pass this (or the label) to an action. */
  value: string;
  label: string;
  selected?: boolean;
  disabled?: boolean;
}

/** One component, as an agent sees it. State keys (`value`, `checked`, `open`…) sit at the top level. */
export interface KrtsAgentComponent {
  /** Stable while the component stays mounted, e.g. `"k3"`. */
  ref: string;
  /** `"button"`, `"switch"`, `"select"`, `"textfield"`… */
  component: string;
  label: string;
  description?: string;
  /** Tooltip text shown for this component. */
  hint?: string;
  /** Name of the dialog, tab, section or group it sits in. */
  section?: string;
  items?: KrtsAgentItem[];
  /** How many more items exist beyond `items`. Use `query` to page through them. */
  more?: number;
  disabled?: boolean;
  /** Present when a person must approve changes here; says what happens. */
  confirm?: string;
  /** Actions you can pass to `act`. */
  actions: string[];
  [state: string]: unknown;
}

export interface KrtsAgentStep {
  /** A ref (`"k3"`), a label (`"Email"`), or `"Section > Label"`. */
  ref: string;
  /** One of the component's `actions`. */
  action: string;
  args?: unknown[];
}

export interface KrtsAgentStepResult {
  ref: string;
  component: string;
  label: string;
  action: string;
  ok: boolean;
  error?: string;
  /** The component's state after the step. */
  state?: Record<string, unknown>;
}

export interface KrtsAgentActResult {
  ok: boolean;
  error?: string;
  steps: KrtsAgentStepResult[];
  /** Steps not run because an earlier one failed. */
  skipped?: number;
  /** Components that appeared during the call, e.g. a dialog that opened. */
  appeared: KrtsAgentComponent[];
  /** Refs of components that went away. */
  gone: string[];
}

export interface KrtsAgentQuery {
  /** Matches labels, descriptions, sections, hints and item labels. */
  text?: string;
  /** Component kind, e.g. `"select"`. */
  kind?: string;
  /** Only components in this section (dialog, tab, group…). */
  within?: string;
  /** First item to list for long choice lists (50 per page). */
  from?: number;
}

export interface KrtsAgentQueryResult {
  components: KrtsAgentComponent[];
  /** How many components matched in total. */
  total: number;
}

/** Sent to `allow()` (or the approval dialog) when a step needs a person's OK. */
export interface KrtsAgentApprovalRequest {
  ref: string;
  component: string;
  label: string;
  action: string;
  args: unknown[];
  /** Why approval is needed: the `confirm` text. */
  confirm: string;
  /** Plain-English summary, e.g. `press “Delete project”`. */
  summary: string;
}

export type KrtsAgentChangeSource = 'agent' | 'user';

export type KrtsAgentEvent =
  | {
      type: 'change';
      ref: string;
      component: string;
      label: string;
      key: string;
      value: unknown;
      previous: unknown;
      /** `'agent'` when an agent step made the change, else `'user'`. */
      source: KrtsAgentChangeSource;
    }
  | { type: 'appear'; ref: string; component: string; label: string }
  | { type: 'disappear'; ref: string; component: string; label: string };
