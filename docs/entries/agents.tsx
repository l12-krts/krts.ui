import { useEffect, useState, type ReactNode } from 'react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Disclosure,
  HoldButton,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Slider,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TextAreaField,
  TextField,
  cn,
  toast,
} from 'krts.ui';
import {
  createKrtsAgent,
  getModelContext,
  registerKrtsAgentTools,
  type KrtsAgentActResult,
  type KrtsAgentComponent,
  type KrtsAgentEvent,
} from 'krts.ui/agent';
import { CodeBlock, Entry, Example } from '../ui';

function Prose({ children }: { children: ReactNode }) {
  return <div className="flex max-w-2xl flex-col gap-3 text-[15px] leading-relaxed text-fg-muted [&_code]:text-[13.5px] [&_code]:text-fg [&_strong]:font-medium [&_strong]:text-fg">{children}</div>;
}

const json = (v: unknown) => JSON.stringify(v, null, 2);

/* ── overview ─────────────────────────────────────────────────────────── */

export function AgentBridgeEntry() {
  return (
    <Entry id="agent-bridge" title="Agent bridge">
      <Prose>
        <p>
          AI agents can read and drive krts.ui components through the components' own APIs, the same React Aria state
          and setters a click would reach, instead of screenshots or guessed coordinates. Every component registers itself
          while it's mounted. <code>krts.ui/agent</code> turns that into three calls:
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>snapshot</strong>: what's on screen. Each component has a ref, a kind, a label, its state, its choices and its actions.
          </li>
          <li>
            <strong>query</strong>: find components by text, kind or section, and page through long lists.
          </li>
          <li>
            <strong>act</strong>: run steps such as <code>setValue</code>, <code>setChecked</code>, <code>select</code> or <code>press</code>, in order. Each
            step's result reports the new state.
          </li>
        </ul>
        <p>Nothing to set up per component. Add the agent and, if you like, the approval dialog.</p>
      </Prose>
      <div className="overflow-hidden rounded-[14px] border border-line-subtle">
        <CodeBlock
          code={`import { createKrtsAgent, KrtsAgentApprovals } from 'krts.ui/agent';

const agent = createKrtsAgent();

agent.snapshot();
// [{ ref: 'k3', component: 'select', label: 'Region', value: 'US East', open: false,
//    items: [{ value: 'us', label: 'US East', selected: true }, …],
//    actions: ['setValue', 'clear', 'open', 'close'] }, …]

const result = await agent.act({ steps: [
  { ref: 'Region', action: 'setValue', args: ['EU West'] },  // a label…
  { ref: 'k7', action: 'setChecked', args: [false] },        // …or a ref
  { ref: 'Billing > Plan', action: 'setValue', args: ['Pro'] }, // "Section > Label"
]});
// { ok: true, steps: [{ …, state: { value: 'EU West' } }, …], appeared: [], gone: [] }

agent.subscribe((e) => console.log(e.type, e.label, e.key, e.value, e.source));

// Once, anywhere: asks a person before confirm-marked steps run.
<KrtsAgentApprovals />`}
        />
      </div>
    </Entry>
  );
}

/* ── playground ───────────────────────────────────────────────────────── */

const DEMO_ID = 'agent-playground-demo';
const playgroundAgent = createKrtsAgent({ root: () => document.getElementById(DEMO_ID) });

const presets: { label: string; steps: unknown[] }[] = [
  {
    label: 'Rename & move',
    steps: [
      { ref: 'Workspace name', action: 'setValue', args: ['Atlas'] },
      { ref: 'Region', action: 'setValue', args: ['EU West'] },
    ],
  },
  {
    label: 'Upgrade',
    steps: [
      { ref: 'Plan', action: 'setValue', args: ['Pro'] },
      { ref: 'Monthly budget', action: 'setValue', args: [300] },
    ],
  },
  {
    label: 'Quiet mode',
    steps: [
      { ref: 'Email notifications', action: 'setChecked', args: [false] },
      { ref: 'Advanced', action: 'expand' },
      { ref: 'Beta features', action: 'setChecked', args: [true] },
    ],
  },
  { label: 'Delete (asks you)', steps: [{ ref: 'Delete workspace', action: 'confirm' }] },
  { label: 'A mistake', steps: [{ ref: 'Region', action: 'setValue', args: ['Mars'] }] },
];

const stepsText = (steps: unknown[]) => `[\n${steps.map((s) => `  ${JSON.stringify(s)}`).join(',\n')}\n]`;

type Logged = Extract<KrtsAgentEvent, { type: 'change' }> & { at: number };

function useAgentView() {
  const [snapshot, setSnapshot] = useState<KrtsAgentComponent[]>([]);
  const [changes, setChanges] = useState<Logged[]>([]);
  useEffect(() => {
    let frame = 0;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setSnapshot(playgroundAgent.snapshot()));
    };
    refresh();
    const off = playgroundAgent.subscribe((e) => {
      refresh();
      if (e.type === 'change') setChanges((l) => [{ ...e, at: Date.now() }, ...l].slice(0, 30));
    });
    // Browsers with WebMCP can drive this playground directly.
    const unregister = registerKrtsAgentTools(playgroundAgent);
    return () => {
      cancelAnimationFrame(frame);
      off();
      unregister();
    };
  }, []);
  return { snapshot, changes };
}

function DemoForm() {
  return (
    <Card id={DEMO_ID} className="flex flex-col gap-5">
      <CardHeader title="Workspace" description="An ordinary krts.ui form. None of it knows about agents." />
      <TextField label="Workspace name" defaultValue="Apollo" size="sm" />
      <Select label="Region" defaultSelectedKey="us" size="sm">
        <SelectItem id="us">US East</SelectItem>
        <SelectItem id="eu">EU West</SelectItem>
        <SelectItem id="ap">Asia Pacific</SelectItem>
      </Select>
      <RadioGroup label="Plan" defaultValue="free" orientation="horizontal">
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
        <Radio value="team">Team</Radio>
      </RadioGroup>
      <Slider
        label="Monthly budget"
        defaultValue={100}
        minValue={0}
        maxValue={500}
        step={50}
        formatOptions={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
      />
      <Switch defaultSelected size="sm">
        Email notifications
      </Switch>
      <Disclosure title="Advanced">
        <Switch size="sm">Beta features</Switch>
      </Disclosure>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onPress={() => toast.success('Saved')}>
          Save
        </Button>
        <HoldButton size="sm" onConfirm={() => toast('Workspace deleted', { description: 'Not really, it’s a demo.' })}>
          Delete workspace
        </HoldButton>
      </div>
    </Card>
  );
}

const pre = 'max-h-96 overflow-auto rounded-[10px] border border-line-subtle bg-surface/50 p-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]';

const fmt = (v: unknown) => (typeof v === 'string' ? `“${v}”` : v === undefined ? '–' : JSON.stringify(v));

export function AgentPlaygroundEntry() {
  const { snapshot, changes } = useAgentView();
  const [text, setText] = useState(stepsText(presets[0]!.steps));
  const [result, setResult] = useState<KrtsAgentActResult | string | null>(null);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<string>('snapshot');
  const webmcp = typeof window !== 'undefined' && !!getModelContext();

  const run = async () => {
    let steps: unknown;
    try {
      const parsed = JSON.parse(text) as unknown;
      steps = Array.isArray(parsed) ? parsed : (parsed as { steps?: unknown }).steps;
    } catch (err) {
      setResult(`That isn't valid JSON: ${(err as Error).message}`);
      setTab('result');
      return;
    }
    setRunning(true);
    try {
      setResult(await playgroundAgent.act({ steps: steps as never }));
    } finally {
      setRunning(false);
      setTab('result');
    }
  };

  return (
    <Entry id="agent-playground" title="Playground">
      <Prose>
        <p>
          Play the agent: pick a preset or write steps, then run them against the form. The snapshot on the right is exactly
          what a model receives. Deleting asks you first, because a HoldButton always needs a person's OK.
        </p>
      </Prose>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <DemoForm />
        <div data-krts-agent-hidden className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <Button key={p.label} size="xs" variant="secondary" onPress={() => setText(stepsText(p.steps))}>
                {p.label}
              </Button>
            ))}
          </div>
          <TextAreaField aria-label="Steps" value={text} onChange={setText} rows={6} className="[&_textarea]:font-mono [&_textarea]:text-[12.5px]" />
          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" isPending={running} onPress={run}>
              Run steps
            </Button>
            <Badge tone={webmcp ? 'success' : 'neutral'} dot>
              WebMCP {webmcp ? 'connected' : 'not in this browser'}
            </Badge>
          </div>
          <Tabs selectedKey={tab} onSelectionChange={(k) => setTab(String(k))}>
            <TabList aria-label="Agent view" variant="underline">
              <Tab id="snapshot">What the agent sees</Tab>
              <Tab id="result">Result</Tab>
              <Tab id="changes">Changes{changes.length ? ` (${changes.length})` : ''}</Tab>
            </TabList>
            <TabPanel id="snapshot">
              <pre className={pre}>{snapshot.map((c) => JSON.stringify(c)).join('\n') || 'Nothing yet.'}</pre>
            </TabPanel>
            <TabPanel id="result">
              <pre className={cn(pre, typeof result === 'object' && result && !result.ok && 'border-danger/40')}>
                {result == null ? 'Run some steps.' : typeof result === 'string' ? result : json(result)}
              </pre>
            </TabPanel>
            <TabPanel id="changes">
              {changes.length ? (
                <ul className="flex max-h-96 flex-col gap-1.5 overflow-auto text-[13px]">
                  {changes.map((c) => (
                    <li key={`${c.at}-${c.ref}-${c.key}`} className="flex items-center gap-2">
                      <Badge tone={c.source === 'agent' ? 'solid' : 'neutral'} className="h-5 px-2 text-[11px]">
                        {c.source}
                      </Badge>
                      <span className="text-fg">{c.label}</span>
                      <span className="truncate text-fg-muted">
                        {c.key}: {fmt(c.previous)} → {fmt(c.value)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-fg-muted">Change something, yourself or with the agent.</p>
              )}
            </TabPanel>
          </Tabs>
        </div>
      </div>
      <div className="overflow-hidden rounded-[14px] border border-line-subtle">
        <CodeBlock
          code={`// Only see the form (plus menus and dialogs opened from it)
const agent = createKrtsAgent({ root: () => document.getElementById('workspace') });

await agent.act({ steps: [
  { ref: 'Plan', action: 'setValue', args: ['Pro'] },
  { ref: 'Monthly budget', action: 'setValue', args: [300] },
]});

// Changes say who made them
agent.subscribe((e) => {
  if (e.type === 'change') log(e.label, e.key, e.previous, '→', e.value, e.source); // 'agent' | 'user'
});`}
        />
      </div>
    </Entry>
  );
}

/* ── permissions ──────────────────────────────────────────────────────── */

const PERMISSIONS_ID = 'agent-permissions-demo';
const permissionsAgent = createKrtsAgent({ root: () => document.getElementById(PERMISSIONS_ID) });

export function AgentPermissionsEntry() {
  const ask = async () => {
    const r = await permissionsAgent.act({ steps: [{ ref: 'Send invoice', action: 'press' }] });
    if (!r.ok) toast.error('The agent was stopped', { description: r.error });
  };
  return (
    <Entry id="agent-permissions" title="Marks & permissions">
      <Prose>
        <p>
          Every component takes an <code>agent</code> prop. Plain elements take the same marks as{' '}
          <code>data-krts-agent-*</code> attributes, which apply to everything inside them.
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>confirm</strong>: a person must approve any change an agent makes. HoldButtons always need approval.
          </li>
          <li>
            <strong>hidden</strong>: agents never see it. Elements hidden from people with <code>hidden</code>, <code>inert</code>,{' '}
            <code>aria-hidden</code> or CSS are left out as well.
          </li>
          <li>
            <strong>secret</strong>: agents see <code>"[redacted]"</code> but can still type into it. Password, card-number and
            one-time-code fields are secret by default.
          </li>
          <li>
            <strong>label</strong> and <strong>description</strong> change what agents read, without changing the UI.
          </li>
        </ul>
        <p>
          Approval goes to <code>allow()</code> if you pass one, or else to <code>{'<KrtsAgentApprovals />'}</code>. With neither,
          those steps are refused. You can also veto any step by calling <code>preventDefault()</code> on the{' '}
          <code>krts:agentact</code> event.
        </p>
      </Prose>
      <Example
        code={`<Button agent={{ confirm: 'Emails the invoice to the customer.' }} onPress={send}>
  Send invoice
</Button>
<TextField label="API key" agent={{ secret: true }} />
<Switch agent={{ hidden: true }}>Debug mode</Switch>
<Button agent={{ label: 'Save draft', description: 'Saves without publishing' }}>Save</Button>

<section data-krts-agent-confirm="Changes what customers pay">…billing…</section>
<aside data-krts-agent-hidden>…your agent chat panel…</aside>

// Your own approval UI instead of <KrtsAgentApprovals />
const agent = createKrtsAgent({
  allow: async (req, { signal }) => myConfirm(req.summary, req.confirm, signal),
});

// Veto anything, anywhere
document.addEventListener('krts:agentact', (e) => {
  if (isLocked(e.detail.label)) e.preventDefault();
});

// Inside onChange: did an agent cause this?
onChange={(v) => track(v, { byAgent: isKrtsAgentActing() })}`}
      >
        <div id={PERMISSIONS_ID}>
          <Button agent={{ confirm: 'Emails the invoice to the customer.' }} onPress={() => toast.success('Invoice sent')}>
            Send invoice
          </Button>
        </div>
        <Button variant="ghost" onPress={ask}>
          Ask the agent to press it →
        </Button>
      </Example>
    </Entry>
  );
}

/* ── tools & WebMCP ───────────────────────────────────────────────────── */

export function AgentToolsEntry() {
  return (
    <Entry id="agent-tools" title="Tools & WebMCP">
      <Prose>
        <p>
          <code>krtsAgentTools</code> describes <code>krts_snapshot</code>, <code>krts_query</code> and <code>krts_act</code> as JSON
          Schema tools for any model API. Send the definitions to your model and pass its tool calls to{' '}
          <code>agent.callTool()</code>. The descriptions tell the model that page text is data, not instructions.
        </p>
        <p>
          In browsers that support WebMCP, <code>registerKrtsAgentTools()</code> offers the same tools to the browser's own
          agent. In other browsers it does nothing.
        </p>
      </Prose>
      <div className="overflow-hidden rounded-[14px] border border-line-subtle">
        <CodeBlock
          code={`import { createKrtsAgent, krtsAgentTools, registerKrtsAgentTools } from 'krts.ui/agent';

const agent = createKrtsAgent();

// 1. Your own model loop: send the tools, route the calls
const tools = krtsAgentTools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }));
for (const call of response.toolCalls) {
  const output = await agent.callTool(call.name, call.input);
  messages.push({ role: 'tool', id: call.id, content: JSON.stringify(output) });
}

// 2. Browser agents, through WebMCP
useEffect(() => registerKrtsAgentTools(agent), []);
// Look but don't touch:
useEffect(() => registerKrtsAgentTools(agent, { readOnly: true }), []);`}
        />
      </div>
    </Entry>
  );
}

/* ── your own components ──────────────────────────────────────────────── */

export function AgentCustomEntry() {
  return (
    <Entry id="agent-custom" title="Your own components">
      <Prose>
        <p>
          Register any component with <code>useKrtsAgentComponent</code> and spread the returned props on its root. Functions
          read the latest render, so closing over props and state is fine. Throw an <code>Error</code> to tell the agent
          what went wrong.
        </p>
      </Prose>
      <div className="overflow-hidden rounded-[14px] border border-line-subtle">
        <CodeBlock
          code={`import { useKrtsAgentComponent } from 'krts.ui/agent';

function Rating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const agentProps = useKrtsAgentComponent({
    component: 'rating',
    state: () => ({ value, max: 5 }),
    actions: {
      setValue: {
        run: ([v]) => {
          const n = Number(v);
          if (!Number.isInteger(n) || n < 1 || n > 5) throw new Error('Pick a whole number from 1 to 5.');
          onChange(n);
        },
      },
      clear: { run: () => onChange(0) },
    },
  });
  // The label comes from the accessible name.
  return <div role="radiogroup" aria-label="Your rating" {...agentProps}>…</div>;
}`}
        />
      </div>
    </Entry>
  );
}

/* ── reference ────────────────────────────────────────────────────────── */

const rows: [string, string, string, string][] = [
  ['Button, CopyButton', 'button', 'pending, expanded', 'press · select(item) on menu triggers · singleTap, doubleTap, multiTap(n), hold, swipe(dir) when handled'],
  ['HoldButton', 'hold-button', 'confirmed', 'confirm (always asks a person)'],
  ['ToggleButton', 'toggle-button', 'selected', 'setSelected(bool), toggle'],
  ['SegmentedControl', 'segmented-control', 'value, items', 'setValue(item or items)'],
  ['DropdownButton, SplitButton', 'button', 'expanded', 'press, select(item)'],
  ['Menu (while open)', 'menu', 'items', 'select(item), close'],
  ['TextField, TextAreaField', 'textfield, textarea', 'value, placeholder, invalid, error', 'setValue(text), clear'],
  ['SearchField', 'searchfield', 'value', 'setValue(text), clear, submit'],
  ['NumberField', 'numberfield', 'value, min, max', 'setValue(n), increment, decrement, clear'],
  ['Select', 'select', 'value, open, items', 'setValue(item or items), clear, open, close'],
  ['Checkbox, Switch', 'checkbox, switch', 'checked', 'setChecked(bool), toggle'],
  ['CheckboxGroup', 'checkbox-group', 'value, items', 'setValue(items), check(item), uncheck(item), toggle(item)'],
  ['RadioGroup', 'radio-group', 'value, items', 'setValue(item)'],
  ['Slider', 'slider', 'value, min, max, step, valueText', 'setValue(n or [n, n]), increment, decrement'],
  ['Tabs', 'tabs', 'value, items', 'setValue(tab)'],
  ['Disclosure', 'disclosure', 'expanded', 'expand, collapse, toggle'],
  ['Dialog, AlertDialog', 'dialog', 'role', 'close'],
  ['Toast', 'toast', 'type, action', 'dismiss, pressAction'],
  ['ProgressBar, Meter', 'progressbar, meter', 'value, min, max, valueText', '—'],
  ['Link', 'link', 'href', 'press'],
  ['GestureArea', 'gesture-area', '—', 'the gestures it handles'],
  ['WithTooltip', '—', 'adds hint to its trigger', '—'],
];

export function AgentComponentsEntry() {
  return (
    <Entry id="agent-components" title="What each component exposes">
      <Prose>
        <p>
          An item can be given by value or by label, ignoring case and accents. Opening, closing, expanding, switching tabs
          and dismissing never need approval, because they only change what's shown.
        </p>
      </Prose>
      <div className="overflow-x-auto rounded-[14px] border border-line-subtle">
        <table className="w-full min-w-[640px] text-left text-[13.5px]">
          <thead className="bg-surface/50 text-fg-subtle">
            <tr>
              {['Component', 'Kind', 'State', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-2.5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, kind, state, actions]) => (
              <tr key={name} className="border-t border-line-subtle align-top">
                <td className="px-4 py-2.5 font-medium text-fg">{name}</td>
                <td className="px-4 py-2.5 font-mono text-[12.5px] text-fg-muted">{kind}</td>
                <td className="px-4 py-2.5 text-fg-muted">{state}</td>
                <td className="px-4 py-2.5 text-fg-muted">{actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Entry>
  );
}
