import { useState } from 'react';
import {
  Button,
  DropdownButton,
  KrtsProvider,
  MenuItem,
  ProgressBar,
  Segment,
  SegmentedControl,
  Select,
  SelectItem,
  Spinner,
  buttonStyles,
  cn,
  floatingSurface,
  focusRing,
  useAnimatedWidth,
  usePerceivedProgress,
  usePrefersReducedMotion,
  useSmoothPending,
  type OverlayAnimation,
} from 'krts.ui';
import { Entry, Example } from '../ui';

export function KrtsProviderEntry() {
  const [animation, setAnimation] = useState<OverlayAnimation>('fade');
  return (
    <Entry id="krts-provider" title="KrtsProvider">
      <Example
        label="Menu animation"
        className="items-start"
        code={`// App-wide default for menus, selects and popovers
<KrtsProvider menuAnimation="scale">
  <App />
</KrtsProvider>

// A prop on one component still wins
<Select animation="none" … />
<DropdownButton animation="fade" … />

// Read the current config in your own components
const { menuAnimation } = useKrtsConfig();`}
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
        <KrtsProvider menuAnimation={animation}>
          <DropdownButton label="Try it" variant="secondary">
            <MenuItem id="a">First item</MenuItem>
            <MenuItem id="b">Second item</MenuItem>
            <MenuItem id="c">Third item</MenuItem>
          </DropdownButton>
          <Select aria-label="Try it" defaultSelectedKey="one" className="w-48">
            <SelectItem id="one">One</SelectItem>
            <SelectItem id="two">Two</SelectItem>
            <SelectItem id="three">Three</SelectItem>
          </Select>
        </KrtsProvider>
      </Example>
    </Entry>
  );
}

export function UseSmoothPendingEntry() {
  const [pending, setPending] = useState(false);
  const show = useSmoothPending(pending, { delay: 150, minDuration: 500 });
  const run = (ms: number) => {
    setPending(true);
    setTimeout(() => setPending(false), ms);
  };
  return (
    <Entry id="use-smooth-pending" title="useSmoothPending">
      <Example
        code={`const [pending, setPending] = useState(false);
// Hidden for work under 150ms; once shown, stays at least 500ms.
const showSpinner = useSmoothPending(pending, { delay: 150, minDuration: 500 });

{showSpinner && <Spinner />}`}
      >
        <Button size="sm" onPress={() => run(60)}>
          Fast (60ms)
        </Button>
        <Button size="sm" onPress={() => run(400)}>
          Medium (400ms)
        </Button>
        <span className="flex h-6 w-24 items-center gap-2 text-sm text-fg-muted">
          {show ? (
            <>
              <Spinner /> Loading
            </>
          ) : (
            'Idle'
          )}
        </span>
      </Example>
    </Entry>
  );
}

export function UsePerceivedProgressEntry() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const progress = usePerceivedProgress(running, done, { expectedDuration: 2500 });
  return (
    <Entry id="use-perceived-progress" title="usePerceivedProgress">
      <Example
        className="grid max-w-md gap-4"
        code={`// Fast at first, eases toward 92%, jumps to 100% when done.
const progress = usePerceivedProgress(isUploading, isDone, { expectedDuration: 2500 });

<ProgressBar label="Uploading" value={progress} />`}
      >
        <ProgressBar label="Uploading" value={progress} />
        <div className="flex gap-2">
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
      </Example>
    </Entry>
  );
}

export function UseAnimatedWidthEntry() {
  const tags = ['Design', 'Design system', 'Design system · v2 migration'];
  const [i, setI] = useState(0);
  const { contentRef, widthStyle, widthTransition } = useAnimatedWidth();
  return (
    <Entry id="use-animated-width" title="useAnimatedWidth">
      <Example
        code={`const { contentRef, widthStyle, widthTransition } = useAnimatedWidth();

<span
  className="inline-flex overflow-hidden rounded-full border px-3"
  style={{ ...widthStyle, transition: widthTransition }}
>
  <span ref={contentRef} className="shrink-0 whitespace-nowrap">{label}</span>
</span>`}
      >
        <span
          className="inline-flex h-8 items-center overflow-hidden rounded-full border border-line bg-surface px-3 text-sm"
          style={{ ...widthStyle, transition: widthTransition }}
        >
          <span ref={contentRef} className="shrink-0 whitespace-nowrap">
            {tags[i]}
          </span>
        </span>
        <Button size="sm" variant="ghost" onPress={() => setI((n) => (n + 1) % tags.length)}>
          Change label
        </Button>
      </Example>
    </Entry>
  );
}

export function UsePrefersReducedMotionEntry() {
  const reduced = usePrefersReducedMotion();
  return (
    <Entry id="use-prefers-reduced-motion" title="usePrefersReducedMotion">
      <Example
        code={`const reduced = usePrefersReducedMotion();
const distance = reduced ? 0 : 24;`}
      >
        <span className="text-sm text-fg-muted">
          Reduced motion is <span className="font-medium text-fg">{reduced ? 'on' : 'off'}</span> on this device.
        </span>
      </Example>
    </Entry>
  );
}

export function StylingUtilitiesEntry() {
  return (
    <Entry id="styling-utilities" title="Styling utilities">
      <Example
        code={`import { buttonStyles, cn, focusRing, floatingSurface } from 'krts.ui';

// Make a plain link look like a Button
<a href="#top" className={buttonStyles({ variant: 'primary', size: 'sm' })}>Back to top</a>

// Merge Tailwind classes (later ones win) and reuse the focus ring
<div tabIndex={0} className={cn('rounded-control p-3', focusRing, isActive && 'bg-surface')} />

// The same surface menus and popovers use
<div className={cn(floatingSurface, 'p-3')}>Floating card</div>`}
      >
        <a href="#top" className={buttonStyles({ variant: 'primary', size: 'sm' })}>
          Back to top
        </a>
        <div tabIndex={0} className={cn('rounded-control border border-line px-3 py-2 text-sm text-fg-muted', focusRing)}>
          Focus me (Tab)
        </div>
        <div className={cn(floatingSurface, 'px-3 py-2 text-sm')}>Floating card</div>
      </Example>
    </Entry>
  );
}
