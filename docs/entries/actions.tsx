import { useState } from 'react';
import {
  Button,
  CheckIcon,
  CopyButton,
  DropdownButton,
  HoldButton,
  MenuItem,
  MenuSection,
  MenuSeparator,
  SplitButton,
  ToggleButton,
  toast,
} from 'krts.ui';
import { Entry, Example, I, Ico } from '../ui';

export function ButtonEntry() {
  const [pending, setPending] = useState(false);
  const [fastPending, setFastPending] = useState(false);
  return (
    <Entry id="button" title="Button">
      <Example
        label="Variants"
        code={`<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost Button</Button>`}
      >
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="ghost">Ghost Button</Button>
      </Example>
      <Example
        label="Sizes & disabled"
        code={`<Button variant="primary" size="xs">Extra small</Button>
<Button variant="primary" size="sm">Small</Button>
<Button variant="primary" size="md">Medium</Button>
<Button isDisabled>Disabled</Button>`}
      >
        <Button variant="primary" size="xs">
          Extra small
        </Button>
        <Button variant="primary" size="sm">
          Small
        </Button>
        <Button variant="primary" size="md">
          Medium
        </Button>
        <Button isDisabled>Disabled</Button>
      </Example>
      <Example
        label="Icons"
        code={`<Button variant="primary" startContent={<PlusIcon />}>New project</Button>
<Button endContent={<DownloadIcon />}>Export</Button>
<Button isIconOnly aria-label="Delete" variant="ghost"><TrashIcon /></Button>`}
      >
        <Button variant="primary" startContent={<Ico d={I.plus} />}>
          New project
        </Button>
        <Button endContent={<Ico d={I.download} />}>Export</Button>
        <Button isIconOnly aria-label="Delete" variant="ghost">
          <Ico d={I.trash} />
        </Button>
      </Example>
      <Example
        label="Content changes ease to the new width"
        code={`const [following, setFollowing] = useState(false);

<Button
  variant={following ? 'secondary' : 'primary'}
  startContent={following ? <CheckIcon /> : null}
  onPress={() => setFollowing((f) => !f)}
>
  {following ? 'Following' : 'Follow'}
</Button>`}
      >
        <WidthDemo />
      </Example>
      <Example
        label="Buttons for actions that take 500+ ms should have a spinner"
        code={`<Button variant="primary" isPending={saving} onPress={save}>
  Save changes
</Button>`}
      >
        <Button
          variant="primary"
          isPending={pending}
          onPress={() => {
            setPending(true);
            setTimeout(() => setPending(false), 1400);
          }}
        >
          Slow save (1.4s)
        </Button>
        <Button
          isPending={fastPending}
          onPress={() => {
            setFastPending(true);
            setTimeout(() => setFastPending(false), 80);
          }}
        >
          Fast save (80ms)
        </Button>
      </Example>
    </Entry>
  );
}

function WidthDemo() {
  const [following, setFollowing] = useState(false);
  const steps = ['Save', 'Saving…', 'Saved to your workspace'] as const;
  const [step, setStep] = useState(0);
  const [verbose, setVerbose] = useState(false);
  return (
    <>
      <Button
        variant={following ? 'secondary' : 'primary'}
        onPress={() => setFollowing((f) => !f)}
        startContent={following ? <CheckIcon size={16} /> : null}
      >
        {following ? 'Following' : 'Follow'}
      </Button>
      <Button
        onPress={() => {
          setStep(1);
          setTimeout(() => setStep(2), 900);
          setTimeout(() => setStep(0), 2600);
        }}
      >
        {steps[step]}
      </Button>
      <Button variant="ghost" onPress={() => setVerbose((v) => !v)}>
        {verbose ? 'Show fewer details' : 'More'}
      </Button>
    </>
  );
}

export function HoldButtonEntry() {
  const [progress, setProgress] = useState(0);
  return (
    <Entry id="hold-button" title="HoldButton">
      <Example
        code={`<HoldButton onConfirm={() => deleteProject()}>
  <TrashIcon /> Delete project
</HoldButton>

<HoldButton
  variant="primary"
  holdDuration={1200}
  confirmedContent="Published"
  onHoldProgress={setProgress}
  onConfirm={publish}
>
  Hold to publish
</HoldButton>

<HoldButton variant="secondary" size="sm" holdDuration={800} onConfirm={reset}>
  Reset
</HoldButton>`}
      >
        <HoldButton onConfirm={() => toast.success('Project deleted', { description: 'It was moved to the trash.' })}>
          <Ico d={I.trash} /> Delete project
        </HoldButton>
        <HoldButton
          variant="primary"
          holdDuration={1200}
          confirmedContent="Published"
          onConfirm={() => toast('Published')}
          onHoldProgress={setProgress}
        >
          Hold to publish
        </HoldButton>
        <HoldButton variant="secondary" size="sm" holdDuration={800} onConfirm={() => toast('Reset')}>
          Reset
        </HoldButton>
        <span className="w-12 text-sm tabular-nums text-fg-subtle">{Math.round(progress * 100)}%</span>
      </Example>
    </Entry>
  );
}

export function CopyButtonEntry() {
  return (
    <Entry id="copy-button" title="CopyButton">
      <Example
        code={`<CopyButton value="npm i krts.ui" />
<CopyButton value="npm i krts.ui" isIconOnly={false} size="md" />
<CopyButton value={() => window.location.href} variant="ghost" label="Copy link" />`}
      >
        <CopyButton value="npm i krts.ui" />
        <CopyButton value="npm i krts.ui" isIconOnly={false} size="md" />
        <CopyButton value={() => window.location.href} variant="ghost" label="Copy link" />
      </Example>
    </Entry>
  );
}

export function ToggleButtonEntry() {
  return (
    <Entry id="toggle-button" title="ToggleButton">
      <Example
        code={`<ToggleButton defaultSelected>Pinned</ToggleButton>
<ToggleButton size="md">Notifications</ToggleButton>
<ToggleButton isIconOnly aria-label="Bold"><BoldIcon /></ToggleButton>`}
      >
        <ToggleButton defaultSelected>Pinned</ToggleButton>
        <ToggleButton size="md">Notifications</ToggleButton>
        <ToggleButton isIconOnly aria-label="Bold">
          <Ico d={I.bold} />
        </ToggleButton>
      </Example>
    </Entry>
  );
}

export function DropdownButtonEntry() {
  const [sort, setSort] = useState<Set<string | number> | 'all'>(new Set(['recent']));
  return (
    <Entry id="dropdown-button" title="DropdownButton">
      <Example
        className="items-start"
        code={`<DropdownButton label="Primary Button" onAction={(key) => run(key)}>
  <MenuItem id="new" shortcut="⌘N">New file</MenuItem>
  <MenuItem id="open" shortcut="⌘O">Open…</MenuItem>
  <MenuItem id="dup" description="Creates a copy next to the original">Duplicate</MenuItem>
  <MenuSeparator />
  <MenuItem id="del" variant="danger" shortcut="⌫">Delete</MenuItem>
</DropdownButton>

<DropdownButton
  label="Secondary Button"
  variant="secondary"
  selectionMode="single"
  selectedKeys={sort}
  onSelectionChange={setSort}
>
  <MenuSection title="Sort by">
    <MenuItem id="recent">Most recent</MenuItem>
    <MenuItem id="name">Name</MenuItem>
    <MenuItem id="size">Size</MenuItem>
  </MenuSection>
</DropdownButton>`}
      >
        <DropdownButton label="Primary Button" onAction={(k) => toast(`Action: ${String(k)}`)}>
          <MenuItem id="new" shortcut="⌘N">
            New file
          </MenuItem>
          <MenuItem id="open" shortcut="⌘O">
            Open…
          </MenuItem>
          <MenuItem id="dup" description="Creates a copy next to the original">
            Duplicate
          </MenuItem>
          <MenuSeparator />
          <MenuItem id="del" variant="danger" shortcut="⌫">
            Delete
          </MenuItem>
        </DropdownButton>
        <DropdownButton label="Secondary Button" variant="secondary" selectionMode="single" selectedKeys={sort} onSelectionChange={setSort}>
          <MenuSection title="Sort by">
            <MenuItem id="recent">Most recent</MenuItem>
            <MenuItem id="name">Name</MenuItem>
            <MenuItem id="size">Size</MenuItem>
          </MenuSection>
        </DropdownButton>
      </Example>
    </Entry>
  );
}

export function SplitButtonEntry() {
  return (
    <Entry id="split-button" title="SplitButton">
      <Example
        className="items-start"
        code={`<SplitButton label="Merge" onAction={merge} onMenuAction={(key) => mergeWith(key)}>
  <MenuItem id="squash">Squash and merge</MenuItem>
  <MenuItem id="rebase">Rebase and merge</MenuItem>
</SplitButton>

<SplitButton label="Save" variant="secondary" size="sm" onAction={save}>
  <MenuItem id="copy">Save a copy</MenuItem>
  <MenuItem id="template">Save as template</MenuItem>
</SplitButton>`}
      >
        <SplitButton label="Merge" onAction={() => toast.success('Merged')} onMenuAction={(k) => toast(`Merged with ${String(k)}`)}>
          <MenuItem id="squash">Squash and merge</MenuItem>
          <MenuItem id="rebase">Rebase and merge</MenuItem>
        </SplitButton>
        <SplitButton label="Save" variant="secondary" size="sm" onAction={() => toast('Saved')}>
          <MenuItem id="copy">Save a copy</MenuItem>
          <MenuItem id="template">Save as template</MenuItem>
        </SplitButton>
      </Example>
    </Entry>
  );
}
