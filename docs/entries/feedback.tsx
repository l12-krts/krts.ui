import { useState } from 'react';
import { Avatar, Button, Meter, ProgressBar, Skeleton, Spinner, Switch, toast } from 'krts.ui';
import { Entry, Example } from '../ui';

export function ToastEntry() {
  return (
    <Entry id="toast" title="Toast">
      <Example
        code={`// Render once, near the root
<Toaster position="bottom-right" />

// Then call from anywhere
toast('Event created', { description: 'Friday, 6 Nov at 4:00 PM' });
toast.success('Saved');
toast.error('Payment failed', { description: 'Your card was declined.' });
toast.promise(deploy(), {
  loading: 'Deploying…',
  success: 'Deployed to production',
  error: 'Deploy failed',
});
toast('Conversation archived', {
  action: { label: 'Undo', onPress: restore },
});`}
      >
        <Button size="md" onPress={() => toast('Event created', { description: 'Friday, 6 Nov at 4:00 PM' })}>
          Default
        </Button>
        <Button size="md" variant="primary" onPress={() => toast.success('Saved')}>
          Success
        </Button>
        <Button size="md" variant="danger" onPress={() => toast.error('Payment failed', { description: 'Your card was declined.' })}>
          Error
        </Button>
        <Button
          size="md"
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
        <Button
          size="md"
          variant="ghost"
          onPress={() => toast('Conversation archived', { action: { label: 'Undo', onPress: () => toast('Restored') } })}
        >
          With action
        </Button>
      </Example>
    </Entry>
  );
}

export function ProgressBarEntry() {
  const [value, setValue] = useState(40);
  return (
    <Entry id="progress-bar" title="ProgressBar">
      <Example
        className="grid max-w-md gap-6"
        code={`<ProgressBar label="Uploading" value={40} />
<ProgressBar aria-label="Loading" isIndeterminate />`}
      >
        <ProgressBar label="Uploading" value={value} />
        <div className="flex gap-2">
          <Button size="sm" onPress={() => setValue((v) => Math.max(0, v - 20))}>
            −20
          </Button>
          <Button size="sm" onPress={() => setValue((v) => Math.min(100, v + 20))}>
            +20
          </Button>
        </div>
        <ProgressBar aria-label="Loading" isIndeterminate />
      </Example>
    </Entry>
  );
}

export function MeterEntry() {
  return (
    <Entry id="meter" title="Meter">
      <Example
        className="grid max-w-md gap-6"
        code={`<Meter label="Storage" value={42} />
<Meter label="CPU" value={78} />
<Meter label="Memory" value={94} thresholds={{ warning: 0.7, danger: 0.9 }} />`}
      >
        <Meter label="Storage" value={42} />
        <Meter label="CPU" value={78} />
        <Meter label="Memory" value={94} thresholds={{ warning: 0.7, danger: 0.9 }} />
      </Example>
    </Entry>
  );
}

export function SpinnerEntry() {
  return (
    <Entry id="spinner" title="Spinner">
      <Example
        code={`<Spinner />
<Spinner size={24} />
<Spinner size={32} label="Loading results" />`}
      >
        <Spinner />
        <Spinner size={24} />
        <Spinner size={32} label="Loading results" />
      </Example>
    </Entry>
  );
}

export function SkeletonEntry() {
  const [loaded, setLoaded] = useState(false);
  return (
    <Entry id="skeleton" title="Skeleton">
      <Example
        className="flex-col items-start gap-5"
        code={`{loaded ? (
  <Profile />
) : (
  <div className="flex items-center gap-3">
    <Skeleton circle className="size-11" />
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-48" />
    </div>
  </div>
)}`}
      >
        <Switch size="sm" isSelected={loaded} onChange={setLoaded}>
          Loaded
        </Switch>
        <div className="flex items-center gap-3">
          {loaded ? <Avatar name="Ada Lovelace" size={44} /> : <Skeleton circle className="size-11" />}
          <div className="flex flex-col gap-2">
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
      </Example>
    </Entry>
  );
}
