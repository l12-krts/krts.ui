import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Accordion,
  AlertDialog,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Checkbox,
  CheckboxGroup,
  CopyButton,
  Dialog,
  DialogTrigger,
  Disclosure,
  Drawer,
  DropdownButton,
  GestureArea,
  HoldButton,
  Kbd,
  KRTS_EVENTS,
  Link,
  MenuItem,
  MenuSection,
  MenuSeparator,
  Meter,
  Modal,
  NumberField,
  ProgressBar,
  Radio,
  RadioGroup,
  SearchField,
  Segment,
  SegmentedControl,
  Select,
  SelectItem,
  Separator,
  Skeleton,
  Slider,
  SplitButton,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TextAreaField,
  TextField,
  Toaster,
  ToggleButton,
  Tooltip,
  TooltipTrigger,
  WithTooltip,
  toast,
  usePerceivedProgress,
  useGesture,
  CheckIcon,
  KrtsProvider,
  type OverlayAnimation,
} from 'krts.ui';

/* ── docs chrome ──────────────────────────────────────────────────────── */

function Section({ id, title, lede, children }: { id: string; title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line-subtle py-14 first:border-t-0">
      <h2 className="text-[13px] font-medium tracking-wide text-fg-subtle uppercase">{title}</h2>
      {lede && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-fg-muted">{lede}</p>}
      <div className="mt-8 flex flex-col gap-8">{children}</div>
    </section>
  );
}

function Demo({ label, children, code, className }: { label?: string; children: ReactNode; code?: string; className?: string }) {
  return (
    <div className="flex flex-col gap-3">
      {label && <div className="text-sm text-fg-muted">{label}</div>}
      <div className={'flex flex-wrap items-center gap-3 ' + (className ?? '')}>{children}</div>
      {code && (
        <div className="relative">
          <pre className="overflow-x-auto rounded-[10px] border border-line-subtle bg-surface/60 p-4 pr-14 text-[12.5px] leading-relaxed text-fg-muted">
            <code>{code.trim()}</code>
          </pre>
          <CopyButton value={code.trim()} size="xs" variant="ghost" className="absolute top-2 right-2" label="Copy code" />
        </div>
      )}
    </div>
  );
}

function useTheme() {
  const [dark, setDark] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);
  return [dark, setDark] as const;
}

const nav = [
  ['buttons', 'Buttons'],
  ['hold', 'HoldButton'],
  ['gestures', 'Gestures'],
  ['tooltips', 'Tooltips'],
  ['dropdowns', 'Dropdowns'],
  ['forms', 'Forms'],
  ['navigation', 'Tabs'],
  ['overlays', 'Overlays'],
  ['feedback', 'Feedback'],
  ['display', 'Display'],
] as const;

/* ── icons for demos ──────────────────────────────────────────────────── */

const I = {
  bold: <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" />,
  italic: <path d="M19 4h-9M14 20H5M15 4 9 20" />,
  underline: <path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16" />,
  link: <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  heart: <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z" />,
  trash: <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
};
const Ico = ({ d, size = 16, fill }: { d: ReactNode; size?: number; fill?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d}
  </svg>
);

/* ── App ──────────────────────────────────────────────────────────────── */

export function App() {
  const [dark, setDark] = useTheme();
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Toaster />
      <header className="sticky top-0 z-40 border-b border-line-subtle bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <a href="#top" className="text-[15px] font-semibold tracking-tight">
            krts<span className="text-fg-subtle">.ui</span>
          </a>
          <nav className="hidden gap-4 text-sm text-fg-muted lg:flex">
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="transition-colors duration-150 hover:text-fg">
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto">
            <WithTooltip content={dark ? 'Light mode' : 'Dark mode'} placement="bottom">
              <Button variant="ghost" size="sm" isIconOnly aria-label="Toggle theme" onPress={() => setDark(!dark)}>
                <Ico d={dark ? I.sun : I.moon} />
              </Button>
            </WithTooltip>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-4 sm:px-6">
        <ButtonsSection />
        <HoldSection />
        <GesturesSection />
        <TooltipSection />
        <DropdownSection />
        <FormsSection />
        <NavigationSection />
        <OverlaySection />
        <FeedbackSection />
        <DisplaySection />

        <footer className="border-t border-line-subtle py-10 text-sm text-fg-subtle">
          krts.ui — MIT. Built on <Link href="https://react-spectrum.adobe.com/react-aria/">React Aria</Link> and{' '}
          <Link href="https://tailwindcss.com">Tailwind CSS</Link>.
        </footer>
      </main>
    </div>
  );
}

/* ── sections ─────────────────────────────────────────────────────────── */

function ButtonsSection() {
  const [pending, setPending] = useState(false);
  const [fastPending, setFastPending] = useState(false);
  return (
    <Section
      id="buttons"
      title="Buttons"
      lede="Four variants from the Figma file. Pressing shows the Figma pressed colours instead of scaling. When a button's label changes, it eases to its new width instead of jumping. Hover styles only apply on devices that can hover."
    >
      <Demo
        code={`<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost Button</Button>`}
      >
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="ghost">Ghost Button</Button>
      </Demo>
      <Demo
        label="Content changes ease to the new width"
        code={`<Button variant="primary" onPress={follow}>
  {following ? 'Following' : 'Follow'}
</Button>`}
      >
        <WidthDemo />
      </Demo>
      <Demo label="Sizes & disabled">
        <Button variant="primary" size="xs">Extra small</Button>
        <Button variant="primary" size="sm">Small</Button>
        <Button variant="primary" size="md">Medium</Button>
        <Button isDisabled>Disabled</Button>
      </Demo>
      <Demo
        label="Pending: no spinner for fast work (<150ms); once shown, it stays at least 500ms so it never flickers"
        code={`<Button variant="primary" isPending={saving} onPress={save}>Save changes</Button>`}
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
      </Demo>
    </Section>
  );
}

function WidthDemo() {
  const [following, setFollowing] = useState(false);
  const steps = ['Save', 'Saving…', 'Saved to your workspace'] as const;
  const [step, setStep] = useState(0);
  const [verbose, setVerbose] = useState(false);
  return (
    <>
      <Button variant={following ? 'secondary' : 'primary'} onPress={() => setFollowing((f) => !f)} startContent={following ? <CheckIcon size={16} /> : null}>
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

function HoldSection() {
  const [progress, setProgress] = useState(0);
  return (
    <Section
      id="hold"
      title="HoldButton"
      lede="Hold to confirm, instead of an “Are you sure?” dialog. The fill is slow and linear while you decide; letting go snaps back fast. Tap it quickly and it tells you to hold. Holding Space or Enter works too."
    >
      <Demo
        code={`<HoldButton onConfirm={() => deleteProject()}>Delete project</HoldButton>
<HoldButton variant="primary" holdDuration={1200} confirmedContent="Published">
  Hold to publish
</HoldButton>`}
      >
        <HoldButton onConfirm={() => toast.success('Project deleted', { description: 'It was moved to the trash.' })}>
          <Ico d={I.trash} /> Delete project
        </HoldButton>
        <HoldButton variant="primary" holdDuration={1200} confirmedContent="Published" onConfirm={() => toast('Published')} onHoldProgress={setProgress}>
          Hold to publish
        </HoldButton>
        <HoldButton variant="secondary" size="sm" holdDuration={800} onConfirm={() => toast('Reset')}>
          Reset
        </HoldButton>
        <span className="w-12 text-sm tabular-nums text-fg-subtle">{Math.round(progress * 100)}%</span>
      </Demo>
    </Section>
  );
}

function GesturesSection() {
  const [log, setLog] = useState<string[]>([]);
  const push = (s: string) => setLog((l) => [s, ...l].slice(0, 8));
  const [likes, setLikes] = useState(0);
  const [heart, setHeart] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // Native CustomEvents bubble too — useful outside React.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const on = (e: Event) => push(`DOM ${e.type}`);
    el.addEventListener(KRTS_EVENTS.doubleTap, on);
    return () => el.removeEventListener(KRTS_EVENTS.doubleTap, on);
  }, []);

  return (
    <Section
      id="gestures"
      title="Gesture events"
      lede={
        <>
          <code className="text-fg">onSingleTap</code> waits only when a double tap is possible. <code className="text-fg">onHold</code> fires after{' '}
          <code className="text-fg">holdDuration</code>, <code className="text-fg">onHoldTick</code> every second you keep holding, and a hold never
          also counts as a tap. Works with mouse, touch, pen, and keyboard. Every gesture also fires a bubbling <code className="text-fg">krts:*</code> DOM
          event.
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <div ref={boxRef}>
          <GestureArea
            aria-label="Gesture playground"
            onSingleTap={(e) => push(`singleTap (${e.pointerType})`)}
            onDoubleTap={(e) => push(`doubleTap (${e.pointerType})`)}
            onHold={(e) => push(`hold ${(e.duration / 1000).toFixed(1)}s`)}
            onHoldTick={(e) => push(`holdTick ${e.seconds}s`)}
            onHoldEnd={(e) => push(`holdEnd after ${(e.duration / 1000).toFixed(1)}s`)}
            onSwipe={(e) => push(`swipe ${e.direction} (${e.velocity.toFixed(2)}px/ms)`)}
            holdDuration={600}
            className="grid h-56 place-items-center rounded-[14px] border border-dashed border-line-strong bg-surface/50 text-center text-fg-muted transition-[background-color] duration-150 ease-out data-[pressed]:bg-surface data-[holding]:bg-surface-hover data-[held]:bg-surface-pressed"
          >
            <div>
              <div className="text-[15px] text-fg">Tap, double-tap, hold, or swipe</div>
              <div className="mt-1 text-sm">Focus it and hold Space for keyboard holds</div>
            </div>
          </GestureArea>
        </div>
        <ol aria-label="Gesture log" aria-live="polite" className="flex h-56 flex-col gap-1 overflow-hidden rounded-[14px] border border-line-subtle p-3 font-mono text-[12.5px]">
          {log.length === 0 && <li className="text-fg-subtle">Events appear here…</li>}
          {log.map((l, i) => (
            <li key={log.length - i} className="text-fg-muted transition-opacity duration-200 starting:opacity-0 first:text-fg">
              {l}
            </li>
          ))}
        </ol>
      </div>
      <Demo
        label="On any Button"
        code={`<Button onDoubleTap={like} aria-label="Like">♥</Button>
<Button onHold={() => setSeconds(0)} onHoldTick={(e) => setSeconds(e.seconds)} holdDuration={3000}>
  Hold for 3s
</Button>`}
      >
        <Button
          variant="secondary"
          onDoubleTap={() => {
            setLikes((n) => n + 1);
            setHeart(true);
            setTimeout(() => setHeart(false), 400);
          }}
          onSingleTap={() => toast('Double-tap to like', { duration: 1500 })}
          startContent={
            <span className={'transition-colors duration-200 ease-out ' + (heart ? 'text-danger-hover' : 'text-danger')}>
              <Ico d={I.heart} fill={likes > 0} />
            </span>
          }
        >
          {likes} likes
        </Button>
        <Button
          variant="primary"
          holdDuration={3000}
          onHoldStart={() => setSeconds(0)}
          onHoldTick={(e) => setSeconds(e.seconds)}
          onHold={() => toast.success('Held for 3 seconds')}
          onHoldCancel={() => setSeconds(0)}
        >
          Hold for 3s · <span className="tabular-nums">{seconds}s</span>
        </Button>
        <MultiTapDemo />
      </Demo>
      <Demo
        label="useGesture on any element"
        code={`const { gestureProps } = useGesture({
  onSingleTap: select,
  onDoubleTap: open,
  onHold: showMenu,
  holdDuration: 500,
});
return <div {...gestureProps} tabIndex={0} role="button">…</div>;`}
      >
        <HookDemo />
      </Demo>
    </Section>
  );
}

function MultiTapDemo() {
  const [count, setCount] = useState(0);
  return (
    <Button onMultiTap={(e) => setCount(e.count)} maxTaps={5}>
      Multi-tap: <span className="w-3 tabular-nums">{count}</span>
    </Button>
  );
}

function HookDemo() {
  const [selected, setSelected] = useState(false);
  const [open, setOpen] = useState(false);
  const { gestureProps, isPressed } = useGesture({
    onSingleTap: () => setSelected((s) => !s),
    onDoubleTap: () => setOpen(true),
    onHold: () => toast('Context menu (hold)'),
  });
  return (
    <>
      <div
        {...gestureProps}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        className={
          'flex h-24 w-40 flex-col items-center justify-center rounded-[12px] border text-sm outline-none select-none transition-[background-color,border-color] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ' +
          (selected
            ? 'border-primary-line ' + (isPressed ? 'bg-primary-pressed text-primary-fg' : 'bg-primary text-primary-fg')
            : 'border-line ' + (isPressed ? 'bg-surface-pressed text-fg' : 'bg-surface text-fg'))
        }
      >
        <span>photo.jpg</span>
        <span className="text-xs opacity-60">tap · double-tap · hold</span>
      </div>
      <DialogTrigger isOpen={open} onOpenChange={setOpen}>
        <Modal>
          <Dialog title="photo.jpg" description="Opened with a double tap.">
            <Skeleton className="h-40 w-full rounded-[10px]" />
          </Dialog>
        </Modal>
      </DialogTrigger>
    </>
  );
}

function TooltipSection() {
  return (
    <Section
      id="tooltips"
      title="Tooltips"
      lede="The first tooltip waits so they don't pop up by accident. Once one is open, its neighbours appear instantly with no animation, which makes the toolbar feel faster. Tooltips scale from their trigger, not from the centre."
    >
      <Demo
        code={`<TooltipTrigger>
  <Button isIconOnly aria-label="Bold">…</Button>
  <Tooltip shortcut="⌘B">Bold</Tooltip>
</TooltipTrigger>`}
      >
        <div className="flex gap-1 rounded-[12px] border border-line bg-surface p-1 shadow-control">
          {(
            [
              ['Bold', '⌘B', I.bold],
              ['Italic', '⌘I', I.italic],
              ['Underline', '⌘U', I.underline],
              ['Insert link', '⌘K', I.link],
            ] as const
          ).map(([label, kb, d]) => (
            <TooltipTrigger key={label}>
              <ToggleButton aria-label={label} size="sm" isIconOnly className="border-transparent shadow-none">
                <Ico d={d} />
              </ToggleButton>
              <Tooltip shortcut={kb}>{label}</Tooltip>
            </TooltipTrigger>
          ))}
        </div>
        <TooltipTrigger>
          <Button>Hover or focus me</Button>
          <Tooltip placement="right" showArrow>
            Tooltips work with keyboard focus too.
          </Tooltip>
        </TooltipTrigger>
      </Demo>
    </Section>
  );
}

function DropdownSection() {
  const [sort, setSort] = useState<Set<string | number> | 'all'>(new Set(['recent']));
  const [animation, setAnimation] = useState<OverlayAnimation>('fade');
  return (
    <Section
      id="dropdowns"
      title="Dropdowns"
      lede="The Figma dropdown button: label, divider, chevron. Menus and selects fade in quickly by default, which suits dashboards where menus open all day. Switch to a scale animation per component or app-wide. Highlighting items with the keyboard is never animated."
    >
      <Demo
        label="Menu animation"
        code={`// one menu
<Select animation="scale" … />
<DropdownButton animation="none" … />

// app-wide default
<KrtsProvider menuAnimation="scale">…</KrtsProvider>`}
        >
          <SegmentedControl
            aria-label="Menu animation"
            selectedKeys={[animation]}
            onSelectionChange={(keys) => {
              const k = [...keys][0];
              if (k) setAnimation(k as OverlayAnimation);
            }}
          >
            <Segment id="fade">Fade (default)</Segment>
            <Segment id="scale">Scale</Segment>
            <Segment id="none">None</Segment>
          </SegmentedControl>
        </Demo>
        <KrtsProvider menuAnimation={animation}>
        <Demo
          className="items-start"
          code={`<DropdownButton label="Primary Button" onAction={(key) => …}>
    <MenuItem id="new" shortcut="⌘N">New file</MenuItem>
    <MenuItem id="dup">Duplicate</MenuItem>
    <MenuSeparator />
    <MenuItem id="del" variant="danger">Delete</MenuItem>
  </DropdownButton>`}
        >
          <DropdownButton label="Primary Button" onAction={(k) => toast(`Action: ${String(k)}`)}>
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
          </DropdownButton>
          <SplitButton label="Merge" onAction={() => toast.success('Merged')} onMenuAction={(k) => toast(`${String(k)}`)}>
            <MenuItem id="Squash and merge">Squash and merge</MenuItem>
            <MenuItem id="Rebase and merge">Rebase and merge</MenuItem>
          </SplitButton>
        </Demo>
        <div className="grid max-w-md gap-4">
          <Select label="Framework" placeholder="Choose one" defaultSelectedKey="react">
            <SelectItem id="react">React</SelectItem>
            <SelectItem id="vue">Vue</SelectItem>
            <SelectItem id="svelte">Svelte</SelectItem>
            <SelectItem id="solid">Solid</SelectItem>
          </Select>
        </div>
      </KrtsProvider>
    </Section>
  );
}

function FormsSection() {
  return (
    <Section id="forms" title="Form controls" lede="Checkboxes, radios, switches, sliders, and inputs from the Figma file. Labels and help text use darker greys than the mock so they pass contrast checks. The switch thumb stretches while pressed, like the Figma “halfway” frame.">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-6">
            <Checkbox>Checkbox</Checkbox>
            <Checkbox defaultSelected>Checked Checkbox</Checkbox>
            <Checkbox isIndeterminate>Indeterminate</Checkbox>
          </div>
          <RadioGroup label="Plan" defaultValue="pro" orientation="horizontal">
            <Radio value="free">Radio Button</Radio>
            <Radio value="pro">Selected Radio Button</Radio>
          </RadioGroup>
          <CheckboxGroup label="Notifications" defaultValue={['email']}>
            <Checkbox value="email">Email</Checkbox>
            <Checkbox value="push">Push</Checkbox>
            <Checkbox value="sms" isDisabled>
              SMS (unavailable)
            </Checkbox>
          </CheckboxGroup>
          <div className="flex flex-wrap gap-6">
            <Switch>Setting Off</Switch>
            <Switch defaultSelected>Setting On</Switch>
            <Switch size="sm" defaultSelected>
              Small
            </Switch>
          </div>
          <Slider label="Slider Fill" defaultValue={50} />
          <Slider label="Price range" defaultValue={[20, 70]} thumbLabels={['Minimum', 'Maximum']} formatOptions={{ style: 'currency', currency: 'USD' }} />
          <Slider aria-label="Plain slider" defaultValue={0} showFill={false} />
        </div>
        <div className="flex flex-col gap-5">
          <TextField label="Name" placeholder="Enter Text..." />
          <TextField label="Email" type="email" defaultValue="Text Written" isInvalid errorMessage="Enter a valid email address." />
          <SearchField label="Search" />
          <NumberField label="Quantity" defaultValue={2} minValue={0} />
          <TextAreaField label="Message" placeholder="Say hello…" description="Markdown is supported." />
        </div>
      </div>
    </Section>
  );
}

function NavigationSection() {
  return (
    <Section id="navigation" title="Tabs & segmented control" lede="The selection indicator slides between items and the text colour changes at the same time.">
      <Tabs>
        <TabList aria-label="Settings">
          <Tab id="general">General</Tab>
          <Tab id="billing">Billing</Tab>
          <Tab id="members">Members</Tab>
          <Tab id="api">API</Tab>
        </TabList>
        <TabPanel id="general" className="text-fg-muted">General settings.</TabPanel>
        <TabPanel id="billing" className="text-fg-muted">Billing settings.</TabPanel>
        <TabPanel id="members" className="text-fg-muted">Members settings.</TabPanel>
        <TabPanel id="api" className="text-fg-muted">API settings.</TabPanel>
      </Tabs>
      <Tabs>
        <TabList aria-label="Repository" variant="underline">
          <Tab id="code">Code</Tab>
          <Tab id="issues">
            Issues <Badge>12</Badge>
          </Tab>
          <Tab id="prs">Pull requests</Tab>
        </TabList>
        <TabPanel id="code" className="text-fg-muted">Code.</TabPanel>
        <TabPanel id="issues" className="text-fg-muted">Issues.</TabPanel>
        <TabPanel id="prs" className="text-fg-muted">Pull requests.</TabPanel>
      </Tabs>
      <Demo>
        <SegmentedControl aria-label="View" defaultSelectedKeys={['week']}>
          <Segment id="day">Day</Segment>
          <Segment id="week">Week</Segment>
          <Segment id="month">Month</Segment>
          <Segment id="year">Year</Segment>
        </SegmentedControl>
        <SegmentedControl aria-label="Align" size="md" defaultSelectedKeys={['left']}>
          <Segment id="left">Left</Segment>
          <Segment id="center">Center</Segment>
          <Segment id="right">Right</Segment>
        </SegmentedControl>
      </Demo>
    </Section>
  );
}

function OverlaySection() {
  return (
    <Section id="overlays" title="Overlays" lede="Modals stay centred, because they aren't attached to a trigger. Drawers slide in by their own size (translate percentages) on an iOS-style curve.">
      <Demo>
        <DialogTrigger>
          <Button variant="primary">Open dialog</Button>
          <Modal>
            <Dialog
              title="Invite teammates"
              description="They'll get an email with a link to join."
              footer={(close) => (
                <>
                  <Button size="sm" onPress={close}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onPress={() => {
                      close();
                      toast.success('Invites sent');
                    }}
                  >
                    Send invites
                  </Button>
                </>
              )}
            >
              <TextField label="Email addresses" placeholder="ana@example.com, li@example.com" autoFocus />
            </Dialog>
          </Modal>
        </DialogTrigger>
        <DialogTrigger>
          <Button variant="danger">Delete account</Button>
          <Modal size="sm">
            <AlertDialog
              title="Delete account?"
              description="This permanently removes your data. This can't be undone."
              variant="danger"
              confirmLabel="Delete"
              onConfirm={() => {
                toast.error('Account deleted');
              }}
            />
          </Modal>
        </DialogTrigger>
        <DialogTrigger>
          <Button>Open drawer</Button>
          <Drawer>
            <Dialog title="Filters" className="h-full">
              <div className="flex flex-col gap-5">
                <CheckboxGroup label="Status" defaultValue={['open']}>
                  <Checkbox value="open">Open</Checkbox>
                  <Checkbox value="closed">Closed</Checkbox>
                </CheckboxGroup>
                <Slider label="Minimum score" defaultValue={30} />
              </div>
            </Dialog>
          </Drawer>
        </DialogTrigger>
        <DialogTrigger>
          <Button>Bottom sheet</Button>
          <Drawer side="bottom">
            <Dialog title="Share" description="Anyone with the link can view.">
              <div className="flex gap-2">
                <TextField aria-label="Link" defaultValue="https://krts.ui/s/a8f3" isReadOnly className="flex-1" />
                <CopyButton value="https://krts.ui/s/a8f3" size="md" isIconOnly={false} />
              </div>
            </Dialog>
          </Drawer>
        </DialogTrigger>
      </Demo>
    </Section>
  );
}

function FeedbackSection() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const progress = usePerceivedProgress(running, done, { expectedDuration: 2500 });
  const [loaded, setLoaded] = useState(true);
  const [archived, setArchived] = useState<string[]>([]);
  const inbox = ['Design review notes', 'Q3 roadmap draft', 'Launch checklist'].filter((x) => !archived.includes(x));

  return (
    <Section
      id="feedback"
      title="Feedback & perceived speed"
      lede="Small, honest tricks that make waiting feel shorter: update the UI right away and offer Undo, show progress that moves quickly at first, use skeletons shaped like the real content, and spin spinners fast."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader title="Optimistic update + Undo" description="Archive happens instantly; Undo is a toast away." />
          <ul className="flex flex-col">
            {inbox.map((item) => (
              <li key={item} className="flex items-center justify-between gap-2 border-t border-line-subtle py-2.5 first:border-t-0">
                <span className="text-[15px]">{item}</span>
                <Button
                  size="xs"
                  variant="ghost"
                  onPress={() => {
                    setArchived((a) => [...a, item]);
                    toast('Conversation archived', {
                      description: item,
                      action: { label: 'Undo', onPress: () => setArchived((a) => a.filter((x) => x !== item)) },
                    });
                  }}
                >
                  Archive
                </Button>
              </li>
            ))}
            {inbox.length === 0 && <li className="py-2.5 text-sm text-fg-subtle">Inbox zero.</li>}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Perceived progress" description="Fast at first, slows near the end, and only reaches 100% when the work is actually done." />
          <ProgressBar label="Uploading" value={progress} />
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="primary"
              isDisabled={running && !done}
              onPress={() => {
                setDone(false);
                setRunning(true);
                setTimeout(() => setDone(true), 3200);
              }}
            >
              Start upload
            </Button>
            <Button
              size="sm"
              onPress={() => {
                setRunning(false);
                setDone(false);
              }}
            >
              Reset
            </Button>
          </div>
          <div className="mt-5">
            <ProgressBar aria-label="Loading" isIndeterminate />
          </div>
        </Card>
        <Card>
          <CardHeader
            title="Skeletons"
            description="Placeholders shaped like the content, so nothing jumps when it loads."
            action={
              <Switch size="sm" isSelected={loaded} onChange={setLoaded}>
                Loaded
              </Switch>
            }
          />
          <div className="flex items-center gap-3">
            {loaded ? <Avatar name="Ada Lovelace" size={44} /> : <Skeleton circle className="size-11" />}
            <div className="flex flex-1 flex-col gap-2">
              {loaded ? (
                <>
                  <div className="text-[15px] leading-4 font-medium">Ada Lovelace</div>
                  <div className="text-sm leading-4 text-fg-muted">Analytical Engine, Inc.</div>
                </>
              ) : (
                <>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                </>
              )}
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Toasts" description="Swipe to dismiss. Timers pause while you hover or switch tabs." />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onPress={() => toast('Event created', { description: 'Friday, 6 Nov at 4:00 PM' })}>
              Default
            </Button>
            <Button size="sm" onPress={() => toast.success('Saved')}>
              Success
            </Button>
            <Button size="sm" onPress={() => toast.error('Payment failed', { description: 'Your card was declined.' })}>
              Error
            </Button>
            <Button
              size="sm"
              onPress={() =>
                toast.promise(new Promise((r) => setTimeout(r, 1800)), {
                  loading: 'Deploying…',
                  success: 'Deployed to production',
                  error: 'Deploy failed',
                })
              }
            >
              Promise
            </Button>
          </div>
          <div className="mt-6">
            <Meter label="Storage" value={78} />
          </div>
        </Card>
      </div>
    </Section>
  );
}

function DisplaySection() {
  return (
    <Section id="display" title="Display">
      <Demo>
        <Badge>Neutral</Badge>
        <Badge tone="solid">Solid</Badge>
        <Badge tone="success" dot>
          Live
        </Badge>
        <Badge tone="warning" dot>
          Degraded
        </Badge>
        <Badge tone="danger" dot>
          Down
        </Badge>
        <Separator orientation="vertical" className="h-6" />
        <span className="flex items-center gap-1 text-sm text-fg-muted">
          Press <Kbd>⌘</Kbd>
          <Kbd>K</Kbd> to search
        </span>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex -space-x-1.5">
          <Avatar name="Ada Lovelace" className="ring-2 ring-bg" />
          <Avatar name="Grace Hopper" className="ring-2 ring-bg" />
          <Avatar name="Alan Turing" className="ring-2 ring-bg" />
        </div>
      </Demo>
      <div className="max-w-2xl">
        <Accordion>
          <Disclosure title="Is it accessible?">
            Yes. Every component is built on React Aria, so keyboard navigation, focus management, and screen-reader labels come
            built in. Holds work with Space/Enter, and screen-reader activation of a HoldButton confirms right away.
          </Disclosure>
          <Disclosure title="Does it respect reduced motion?">
            Yes. With reduced motion turned on, movement and scaling are removed but opacity and colour fades stay, because they still
            help explain what changed.
          </Disclosure>
          <Disclosure title="Can I theme it?">
            Every colour is a <code>--krts-*</code> CSS variable. Override them on <code>:root</code> or on any element.
          </Disclosure>
        </Accordion>
      </div>
    </Section>
  );
}


