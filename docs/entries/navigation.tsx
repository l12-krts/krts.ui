import { Accordion, Badge, CardHeader, Disclosure, Link, Segment, SegmentedControl, Tab, TabList, TabPanel, Tabs } from 'krts.ui';
import { Entry, Example } from '../ui';

export function TabsEntry() {
  return (
    <Entry id="tabs" title="Tabs">
      <Example
        className="block"
        label="Pill"
        code={`<Tabs>
  <TabList aria-label="Settings">
    <Tab id="general">General</Tab>
    <Tab id="billing">Billing</Tab>
    <Tab id="members">Members</Tab>
    <Tab id="api">API</Tab>
  </TabList>
  <TabPanel id="general">General settings.</TabPanel>
  <TabPanel id="billing">Billing settings.</TabPanel>
  <TabPanel id="members">Members settings.</TabPanel>
  <TabPanel id="api">API settings.</TabPanel>
</Tabs>`}
      >
        <Tabs>
          <TabList aria-label="Settings">
            <Tab id="general">General</Tab>
            <Tab id="billing">Billing</Tab>
            <Tab id="members">Members</Tab>
            <Tab id="api">API</Tab>
          </TabList>
          <TabPanel id="general" className="text-fg-muted">
            General settings.
          </TabPanel>
          <TabPanel id="billing" className="text-fg-muted">
            Billing settings.
          </TabPanel>
          <TabPanel id="members" className="text-fg-muted">
            Members settings.
          </TabPanel>
          <TabPanel id="api" className="text-fg-muted">
            API settings.
          </TabPanel>
        </Tabs>
      </Example>
      <Example
        className="block"
        label="Underline"
        code={`<Tabs>
  <TabList aria-label="Repository" variant="underline">
    <Tab id="code">Code</Tab>
    <Tab id="issues">Issues <Badge>12</Badge></Tab>
    <Tab id="prs">Pull requests</Tab>
  </TabList>
  <TabPanel id="code">Code.</TabPanel>
  <TabPanel id="issues">Issues.</TabPanel>
  <TabPanel id="prs">Pull requests.</TabPanel>
</Tabs>`}
      >
        <Tabs>
          <TabList aria-label="Repository" variant="underline">
            <Tab id="code">Code</Tab>
            <Tab id="issues">
              Issues <Badge>12</Badge>
            </Tab>
            <Tab id="prs">Pull requests</Tab>
          </TabList>
          <TabPanel id="code" className="text-fg-muted">
            Code.
          </TabPanel>
          <TabPanel id="issues" className="text-fg-muted">
            Issues.
          </TabPanel>
          <TabPanel id="prs" className="text-fg-muted">
            Pull requests.
          </TabPanel>
        </Tabs>
      </Example>
    </Entry>
  );
}

export function SegmentedControlEntry() {
  return (
    <Entry id="segmented-control" title="SegmentedControl">
      <Example
        code={`<SegmentedControl aria-label="View" defaultSelectedKeys={['week']}>
  <Segment id="day">Day</Segment>
  <Segment id="week">Week</Segment>
  <Segment id="month">Month</Segment>
  <Segment id="year">Year</Segment>
</SegmentedControl>

<SegmentedControl aria-label="Align" size="md" defaultSelectedKeys={['left']}>
  <Segment id="left">Left</Segment>
  <Segment id="center">Center</Segment>
  <Segment id="right">Right</Segment>
</SegmentedControl>`}
      >
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
      </Example>
    </Entry>
  );
}

export function AccordionEntry() {
  return (
    <Entry id="accordion" title="Accordion & Disclosure">
      <Example
        className="block max-w-2xl"
        code={`<Accordion>
  <Disclosure title="Is it accessible?">…</Disclosure>
  <Disclosure title="Does it respect reduced motion?">…</Disclosure>
  <Disclosure title="Can I theme it?">…</Disclosure>
</Accordion>

// allowsMultipleExpanded lets several open at once
<Accordion allowsMultipleExpanded>…</Accordion>`}
      >
        <CardHeader title="FAQ's" />
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
      </Example>
    </Entry>
  );
}

export function LinkEntry() {
  return (
    <Entry id="link" title="Link">
      <Example
        code={`<Link href="https://react-spectrum.adobe.com/react-aria/">React Aria</Link>
<Link href="https://tailwindcss.com" target="_blank">Tailwind CSS</Link>`}
      >
        <span className="text-fg-muted">
          Built on <Link href="https://react-spectrum.adobe.com/react-aria/">React Aria</Link> and{' '}
          <Link href="https://tailwindcss.com" target="_blank">
            Tailwind CSS
          </Link>
          .
        </span>
      </Example>
    </Entry>
  );
}
