import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Dialog,
  DialogTrigger,
  Disclosure,
  DropdownButton,
  HoldButton,
  MenuItem,
  Modal,
  NumberField,
  ProgressBar,
  Radio,
  RadioGroup,
  Segment,
  SegmentedControl,
  Select,
  SelectItem,
  Slider,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TextField,
  ToggleButton,
  WithTooltip,
} from '../src';
import {
  createKrtsAgent,
  isKrtsAgentActing,
  KrtsAgentApprovals,
  krtsAgentTools,
  registerKrtsAgentTools,
  type KrtsAgentActResult,
  type KrtsAgentEvent,
  type KrtsAgentOptions,
  type KrtsAgentStep,
} from '../src/agent';

// Agents act from outside React, like a real page: no act() batching, which
// would hold every render until the whole call finished.
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
});
afterEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

function setup(options?: KrtsAgentOptions) {
  const agent = createKrtsAgent(options);
  const run = (steps: KrtsAgentStep[]) => agent.act({ steps });
  const find = (label: string) => agent.snapshot().find((c) => c.label === label);
  return { agent, run, find };
}

describe('snapshot', () => {
  it('lists components with label, state and actions', () => {
    const { agent } = setup();
    render(
      <>
        <Switch defaultSelected>Wi-Fi</Switch>
        <TextField label="Project name" defaultValue="Apollo" />
        <Button>Save</Button>
      </>,
    );
    expect(agent.snapshot()).toEqual([
      expect.objectContaining({ component: 'switch', label: 'Wi-Fi', checked: true, actions: ['setChecked', 'toggle'] }),
      expect.objectContaining({ component: 'textfield', label: 'Project name', value: 'Apollo', actions: ['setValue', 'clear'] }),
      expect.objectContaining({ component: 'button', label: 'Save', actions: ['press'] }),
    ]);
    expect(agent.snapshot()[0]!.ref).toMatch(/^k\d+$/);
  });

  it('leaves out hidden components and regions, and redacts secrets', () => {
    const { agent, find } = setup();
    render(
      <>
        <Switch agent={{ hidden: true }}>Debug mode</Switch>
        <div data-krts-agent-hidden>
          <Button>Admin only</Button>
        </div>
        <TextField label="API key" defaultValue="sk-123" agent={{ secret: true }} />
        <TextField label="Password" type="password" defaultValue="hunter2" />
        <Button agent={{ label: 'Save draft', description: 'Saves without publishing' }}>Save</Button>
      </>,
    );
    const labels = agent.snapshot().map((c) => c.label);
    expect(labels).not.toContain('Debug mode');
    expect(labels).not.toContain('Admin only');
    expect(find('API key')?.value).toBe('[redacted]');
    expect(find('Password')?.value).toBe('[redacted]');
    expect(find('Save draft')).toMatchObject({ description: 'Saves without publishing' });
  });

  it('reads tooltips as hints and progress as state', () => {
    const { find } = setup();
    render(
      <>
        <WithTooltip content="Saves to the cloud" shortcut="⌘S">
          <Button>Save</Button>
        </WithTooltip>
        <ProgressBar label="Upload" value={40} />
      </>,
    );
    expect(find('Save')?.hint).toBe('Saves to the cloud (⌘S)');
    expect(find('Upload')).toMatchObject({ component: 'progressbar', value: 40, min: 0, max: 100, actions: [] });
  });
});

describe('act', () => {
  it('drives a Switch through React Aria and reports the new state', async () => {
    const { run } = setup();
    const seen: boolean[] = [];
    render(<Switch defaultSelected onChange={() => seen.push(isKrtsAgentActing())}>Wi-Fi</Switch>);
    const result = await run([{ ref: 'Wi-Fi', action: 'setChecked', args: [false] }]);
    expect(result.ok).toBe(true);
    expect(result.steps[0]).toMatchObject({ ok: true, state: { checked: false } });
    expect(screen.getByRole('switch')).not.toBeChecked();
    expect(seen).toEqual([true]);
  });

  it('types into controlled and uncontrolled text fields', async () => {
    const { run, find } = setup();
    const onChange = vi.fn();
    function Controlled() {
      const [v, setV] = useState('');
      return <TextField label="Email" value={v} onChange={(x) => (setV(x), onChange(x))} />;
    }
    render(
      <>
        <Controlled />
        <TextField label="Name" />
      </>,
    );
    const result = await run([
      { ref: 'Email', action: 'setValue', args: ['ada@example.com'] },
      { ref: 'Name', action: 'setValue', args: ['Ada'] },
    ]);
    expect(result.ok).toBe(true);
    expect(onChange).toHaveBeenCalledWith('ada@example.com');
    expect(find('Email')?.value).toBe('ada@example.com');
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Ada');
  });

  it('chooses Select options by label without opening the list', async () => {
    const { run, find } = setup();
    const onSelectionChange = vi.fn();
    render(
      <Select label="Theme" onSelectionChange={onSelectionChange}>
        <SelectItem id="light">Light</SelectItem>
        <SelectItem id="dark">Dark</SelectItem>
      </Select>,
    );
    expect(find('Theme')).toMatchObject({
      value: null,
      open: false,
      items: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ],
      actions: ['setValue', 'clear', 'open', 'close'],
    });
    const result = await run([{ ref: 'Theme', action: 'setValue', args: ['dark'] }]);
    expect(result.ok).toBe(true);
    expect(onSelectionChange).toHaveBeenCalledWith('dark');
    expect(find('Theme')).toMatchObject({ value: 'Dark', open: false });

    const bad = await run([{ ref: 'Theme', action: 'setValue', args: ['Purple'] }]);
    expect(bad.ok).toBe(false);
    expect(bad.error).toContain('No option “Purple”');
    expect(bad.error).toContain('“Light”, “Dark”');
  });

  it('handles radio groups, checkbox groups and standalone checkboxes', async () => {
    const { run, find } = setup();
    render(
      <>
        <RadioGroup label="Plan" defaultValue="free">
          <Radio value="free">Free</Radio>
          <Radio value="pro">Pro</Radio>
        </RadioGroup>
        <CheckboxGroup label="Notify me by">
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="sms">SMS</Checkbox>
        </CheckboxGroup>
        <Checkbox>I agree</Checkbox>
      </>,
    );
    // Checkboxes inside a group are the group's items, not components of their own.
    expect(find('Email')).toBeUndefined();
    const result = await run([
      { ref: 'Plan', action: 'setValue', args: ['Pro'] },
      { ref: 'Notify me by', action: 'setValue', args: [['Email', 'sms']] },
      { ref: 'Notify me by', action: 'uncheck', args: ['SMS'] },
      { ref: 'I agree', action: 'setChecked', args: [true] },
    ]);
    expect(result.ok).toBe(true);
    expect(find('Plan')?.value).toBe('Pro');
    expect(find('Notify me by')?.value).toEqual(['Email']);
    expect(find('I agree')?.checked).toBe(true);
  });

  it('sets sliders, number fields and segmented controls', async () => {
    const { run, find } = setup();
    const onChangeEnd = vi.fn();
    render(
      <>
        <Slider label="Volume" defaultValue={20} onChangeEnd={onChangeEnd} />
        <NumberField label="Seats" defaultValue={2} minValue={1} maxValue={10} />
        <SegmentedControl aria-label="View" defaultSelectedKeys={['list']}>
          <Segment id="list">List</Segment>
          <Segment id="grid">Grid</Segment>
        </SegmentedControl>
        <ToggleButton>Bold</ToggleButton>
      </>,
    );
    const result = await run([
      { ref: 'Volume', action: 'setValue', args: [60] },
      { ref: 'Seats', action: 'increment' },
      { ref: 'View', action: 'setValue', args: ['Grid'] },
      { ref: 'Bold', action: 'setSelected', args: [true] },
    ]);
    expect(result.ok).toBe(true);
    expect(find('Volume')).toMatchObject({ value: 60, min: 0, max: 100 });
    expect(onChangeEnd).toHaveBeenCalledWith(60);
    expect(find('Seats')).toMatchObject({ value: 3, min: 1, max: 10 });
    expect(find('View')?.value).toBe('Grid');
    expect(find('Bold')?.selected).toBe(true);

    const tooBig = await run([{ ref: 'Seats', action: 'setValue', args: [50] }]);
    expect(tooBig.error).toContain('The maximum is 10');
  });

  it('switches tabs and expands disclosures, reporting what appeared', async () => {
    const { run, find } = setup();
    render(
      <>
        <Tabs>
          <TabList aria-label="Settings">
            <Tab id="general">General</Tab>
            <Tab id="billing">Billing</Tab>
          </TabList>
          <TabPanel id="general">
            <Switch>Dark mode</Switch>
          </TabPanel>
          <TabPanel id="billing">
            <TextField label="Card holder" />
          </TabPanel>
        </Tabs>
        <Disclosure title="Advanced">
          <Switch>Beta features</Switch>
        </Disclosure>
      </>,
    );
    expect(find('Settings')).toMatchObject({ component: 'tabs', value: 'General' });
    expect(find('Beta features')).toBeUndefined();

    const result = await run([
      { ref: 'Settings', action: 'setValue', args: ['Billing'] },
      { ref: 'Advanced', action: 'expand' },
    ]);
    expect(result.ok).toBe(true);
    const appeared = result.appeared.map((c) => c.label);
    expect(appeared).toEqual(expect.arrayContaining(['Card holder', 'Beta features']));
    expect(find('Card holder')?.section).toBe('Billing');
    expect(find('Dark mode')).toBeUndefined();
  });

  it('opens dialogs, sees inside them, and closes them', async () => {
    const { run, find, agent } = setup();
    render(
      <>
        <DialogTrigger>
          <Button>Open settings</Button>
          <Modal>
            <Dialog title="Settings" description="Applies to every project">
              <Switch>Wi-Fi</Switch>
            </Dialog>
          </Modal>
        </DialogTrigger>
        <Button>Behind the dialog</Button>
      </>,
    );
    const opened = await run([{ ref: 'Open settings', action: 'press' }]);
    expect(opened.appeared.map((c) => c.component)).toEqual(['dialog', 'switch', 'button']);
    // The modal hides the page behind it, so agents only see the dialog.
    expect(agent.snapshot()[0]).toMatchObject({ component: 'dialog', label: 'Settings', description: 'Applies to every project' });
    expect(find('Behind the dialog')).toBeUndefined();
    expect(find('Wi-Fi')?.section).toBe('Settings');

    const closed = await run([{ ref: 'Settings', action: 'close' }]);
    expect(closed.ok).toBe(true);
    await waitFor(() => expect(find('Behind the dialog')).toBeDefined());
  });

  it('picks menu items through a closed DropdownButton', async () => {
    const { run, find } = setup();
    const onAction = vi.fn();
    render(
      <DropdownButton label="Export" onAction={onAction}>
        <MenuItem id="pdf">PDF</MenuItem>
        <MenuItem id="csv">CSV</MenuItem>
      </DropdownButton>,
    );
    expect(find('Export')?.actions).toEqual(['press', 'select']);
    const result = await run([{ ref: 'Export', action: 'select', args: ['CSV'] }]);
    expect(result.ok).toBe(true);
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction.mock.calls[0]![0]).toBe('csv');
  });

  it('calls gesture handlers with virtual events', async () => {
    const { run, find } = setup();
    const onDoubleTap = vi.fn();
    const onSwipe = vi.fn();
    render(
      <Button onDoubleTap={onDoubleTap} onSwipe={onSwipe}>
        Like
      </Button>,
    );
    expect(find('Like')?.actions).toEqual(['press', 'doubleTap', 'swipe']);
    const result = await run([
      { ref: 'Like', action: 'doubleTap' },
      { ref: 'Like', action: 'swipe', args: ['left'] },
    ]);
    expect(result.ok).toBe(true);
    expect(onDoubleTap).toHaveBeenCalledWith(expect.objectContaining({ type: 'doubletap', count: 2, pointerType: 'virtual' }));
    expect(onSwipe).toHaveBeenCalledWith(expect.objectContaining({ direction: 'left' }));
  });
});

describe('finding components', () => {
  it('asks for a ref or "Section > Label" when labels repeat', async () => {
    const { run, find } = setup();
    render(
      <>
        <RadioGroup label="Home" defaultValue="a">
          <Radio value="a">A</Radio>
        </RadioGroup>
        <div role="group" aria-label="Home office">
          <Switch>Lights</Switch>
        </div>
        <div role="group" aria-label="Kitchen">
          <Switch>Lights</Switch>
        </div>
      </>,
    );
    const ambiguous = await run([{ ref: 'Lights', action: 'toggle' }]);
    expect(ambiguous.ok).toBe(false);
    expect(ambiguous.error).toMatch(/matches 2 components: k\d+ \(switch “Lights” in Home office\), k\d+ \(switch “Lights” in Kitchen\)/);

    const ok = await run([{ ref: 'Kitchen > Lights', action: 'setChecked', args: [true] }]);
    expect(ok.ok).toBe(true);
    expect(screen.getAllByRole('switch')[1]).toBeChecked();

    const missing = await run([{ ref: 'Garage', action: 'press' }]);
    expect(missing.error).toContain('Nothing called “Garage”');
    expect(find('Lights')).toBeDefined();
  });

  it('limits an agent to its root, plus dialogs opened from it', async () => {
    const { agent, run } = setup({ root: () => document.getElementById('scope') });
    render(
      <>
        <div id="scope">
          <DialogTrigger>
            <Button>Open</Button>
            <Modal>
              <Dialog title="Inside">
                <Switch>Wi-Fi</Switch>
              </Dialog>
            </Modal>
          </DialogTrigger>
        </div>
        <Switch>Outside</Switch>
      </>,
    );
    expect(agent.snapshot().map((c) => c.label)).toEqual(['Open']);
    expect((await run([{ ref: 'Outside', action: 'toggle' }])).ok).toBe(false);
    const opened = await run([{ ref: 'Open', action: 'press' }]);
    expect(opened.appeared.map((c) => c.label)).toEqual(['Inside', 'Wi-Fi', 'Close']);
  });

  it('rejects malformed input before running anything', async () => {
    const { agent } = setup();
    expect(await agent.act({ steps: [] })).toMatchObject({ ok: false, error: expect.stringContaining('at least one step') });
    expect(await agent.act({ steps: [{ ref: 'x' } as KrtsAgentStep] })).toMatchObject({ ok: false });
  });

  it('stops at the first failure and says what was skipped', async () => {
    const { run } = setup();
    render(<Switch isDisabled>Locked</Switch>);
    const result = await run([
      { ref: 'Locked', action: 'toggle' },
      { ref: 'Locked', action: 'toggle' },
    ]);
    expect(result).toMatchObject({ ok: false, skipped: 1 });
    expect(result.error).toContain('is disabled');
  });

  it('finds components and pages through choices with query', () => {
    const { agent } = setup();
    const countries = Array.from({ length: 70 }, (_, i) => ({ id: `c${i}`, name: `Country ${i}` }));
    render(
      <>
        <Select label="Country" items={countries}>
          {(c) => <SelectItem id={c.id}>{c.name}</SelectItem>}
        </Select>
        <TextField label="City" />
      </>,
    );
    const [snap] = agent.snapshot();
    expect(snap?.items).toHaveLength(20);
    expect(snap?.more).toBe(50);
    const page2 = agent.query({ text: 'country', from: 50 });
    expect(page2.total).toBe(1);
    expect(page2.components[0]?.items?.[0]?.label).toBe('Country 50');
    expect(agent.query({ kind: 'textfield' }).components.map((c) => c.label)).toEqual(['City']);
  });
});

describe('permissions', () => {
  it('refuses confirm-marked steps when nobody can approve them', async () => {
    const { run, find } = setup();
    const onPress = vi.fn();
    render(
      <Button agent={{ confirm: 'Deletes the project' }} onPress={onPress}>
        Delete
      </Button>,
    );
    expect(find('Delete')?.confirm).toBe('Deletes the project');
    const result = await run([{ ref: 'Delete', action: 'press' }]);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("needs a person's OK");
    expect(onPress).not.toHaveBeenCalled();
  });

  it('asks allow(), and runs the step only on true', async () => {
    const allow = vi.fn<NonNullable<KrtsAgentOptions['allow']>>(() => false);
    const { run } = setup({ allow });
    const onPress = vi.fn();
    render(
      <section data-krts-agent-confirm="Changes billing">
        <Button onPress={onPress}>Upgrade</Button>
      </section>,
    );
    const declined = await run([{ ref: 'Upgrade', action: 'press' }]);
    expect(declined.error).toContain('A person declined');
    expect(allow).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Upgrade', action: 'press', confirm: 'Changes billing', summary: 'press “Upgrade”' }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    allow.mockReturnValue(true);
    expect((await run([{ ref: 'Upgrade', action: 'press' }])).ok).toBe(true);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('always asks before confirming a HoldButton', async () => {
    const onConfirm = vi.fn();
    const { run, find } = setup({ allow: () => true });
    render(<HoldButton onConfirm={onConfirm}>Delete project</HoldButton>);
    expect(find('Delete project')).toMatchObject({ component: 'hold-button', actions: ['confirm'], confirm: expect.any(String) });
    const result = await run([{ ref: 'Delete project', action: 'confirm' }]);
    expect(result.ok).toBe(true);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows the built-in approval dialog, which agents cannot see', async () => {
    const { agent } = setup();
    const onPress = vi.fn();
    render(
      <>
        <KrtsAgentApprovals />
        <Button agent={{ confirm: 'Deletes the project' }} onPress={onPress}>
          Delete
        </Button>
      </>,
    );
    const pending = agent.act({ steps: [{ ref: 'Delete', action: 'press' }] });
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('An agent wants to press “Delete”.');
    expect(dialog).toHaveTextContent('Deletes the project');
    expect(agent.snapshot().map((c) => c.label)).not.toContain('Allow');

    await userEvent.setup().click(screen.getByRole('button', { name: 'Allow' }));
    const result = await pending;
    expect(result.ok).toBe(true);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('lets the app refuse a step through the krts:agentact event', async () => {
    const { run } = setup();
    render(
      <div ref={(el) => el?.addEventListener('krts:agentact', (e) => e.preventDefault())}>
        <Switch>Wi-Fi</Switch>
      </div>,
    );
    const result = await run([{ ref: 'Wi-Fi', action: 'toggle' }]);
    expect(result.error).toContain('The app refused this step');
    expect(screen.getByRole('switch')).not.toBeChecked();
  });
});

describe('subscribe', () => {
  it('tells agent changes from user changes', async () => {
    const { agent, run } = setup();
    render(<Switch>Wi-Fi</Switch>);
    const events: KrtsAgentEvent[] = [];
    const off = agent.subscribe((e) => events.push(e));

    await run([{ ref: 'Wi-Fi', action: 'setChecked', args: [true] }]);
    expect(events).toContainEqual(expect.objectContaining({ type: 'change', key: 'checked', value: true, previous: false, source: 'agent' }));

    await userEvent.setup().click(screen.getByRole('switch'));
    await waitFor(() =>
      expect(events).toContainEqual(expect.objectContaining({ type: 'change', key: 'checked', value: false, source: 'user' })),
    );
    off();
  });

  it('does not report a Select filling in its options as a change', async () => {
    const { agent } = setup();
    render(
      <Select label="Region" defaultSelectedKey="us">
        <SelectItem id="us">US East</SelectItem>
      </Select>,
    );
    const events: KrtsAgentEvent[] = [];
    const off = agent.subscribe((e) => events.push(e));
    await new Promise((r) => setTimeout(r, 120));
    expect(events).toEqual([]);
    off();
  });
});

describe('tools', () => {
  it('routes tool calls and describes them with JSON Schema', async () => {
    const { agent } = setup();
    render(<TextField label="Email" />);
    expect(krtsAgentTools.map((t) => t.name)).toEqual(['krts_snapshot', 'krts_query', 'krts_act']);
    const snap = (await agent.callTool('krts_snapshot')) as { components: { label: string }[] };
    expect(snap.components.map((c) => c.label)).toEqual(['Email']);
    const acted = (await agent.callTool('krts_act', { steps: [{ ref: 'Email', action: 'setValue', args: ['a@b.co'] }] })) as KrtsAgentActResult;
    expect(acted.ok).toBe(true);
  });

  it('registers with WebMCP when the browser offers it', async () => {
    const { agent } = setup();
    render(<Switch>Wi-Fi</Switch>);
    interface FakeTool {
      name: string;
      annotations: object;
      execute: (input: unknown) => Promise<{ content: { text: string }[] }>;
    }
    const tools = new Map<string, FakeTool>();
    Object.defineProperty(navigator, 'modelContext', {
      configurable: true,
      value: {
        registerTool(tool: FakeTool) {
          tools.set(tool.name, tool);
          return { unregister: () => tools.delete(tool.name) };
        },
      },
    });
    try {
      const off = registerKrtsAgentTools(agent, { readOnly: true });
      expect([...tools.keys()]).toEqual(['krts_snapshot', 'krts_query']);
      expect(tools.get('krts_snapshot')?.annotations).toMatchObject({ readOnlyHint: true, untrustedContentHint: true });
      const out = await tools.get('krts_snapshot')!.execute({});
      expect(JSON.parse(out.content[0]!.text).components[0]).toMatchObject({ label: 'Wi-Fi', checked: false });
      off();
      expect(tools.size).toBe(0);
    } finally {
      delete (navigator as { modelContext?: unknown }).modelContext;
    }
  });

  it('does nothing without WebMCP', () => {
    const { agent } = setup();
    expect(registerKrtsAgentTools(agent)).toBeTypeOf('function');
  });
});
