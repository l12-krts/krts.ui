import { TextField as RACTextField } from 'react-aria-components';
import {
  Checkbox,
  CheckboxGroup,
  Description,
  FieldError,
  Input,
  Label,
  NumberField,
  Radio,
  RadioGroup,
  SearchField,
  Select,
  SelectItem,
  Slider,
  Switch,
  TextAreaField,
  TextField,
  inputFrame,
} from 'krts.ui';
import { Entry, Example } from '../ui';

export function TextFieldEntry() {
  return (
    <Entry id="text-field" title="TextField">
      <Example
        className="grid max-w-md"
        code={`<TextField label="Name" placeholder="Enter Text..." />
<TextField
  label="Email"
  type="email"
  defaultValue="Text Written"
  isInvalid
  errorMessage="Enter a valid email address."
/>
<TextField label="Username" description="Lowercase letters only." size="sm" />`}
      >
        <TextField label="Name" placeholder="Enter Text..." />
        <TextField label="Email" type="email" defaultValue="Text Written" isInvalid errorMessage="Enter a valid email address." />
        <TextField label="Username" description="Lowercase letters only." size="sm" />
      </Example>
    </Entry>
  );
}

export function TextAreaFieldEntry() {
  return (
    <Entry id="textarea-field" title="TextAreaField">
      <Example className="grid max-w-md" code={`<TextAreaField label="Message" placeholder="Say hello…" rows={4} />`}>
        <TextAreaField label="Message" placeholder="Say hello…" rows={4} />
      </Example>
    </Entry>
  );
}

export function SearchFieldEntry() {
  return (
    <Entry id="search-field" title="SearchField">
      <Example className="grid max-w-md" code={`<SearchField label="Search" onSubmit={(q) => search(q)} />`}>
        <SearchField label="Search" />
      </Example>
    </Entry>
  );
}

export function NumberFieldEntry() {
  return (
    <Entry id="number-field" title="NumberField">
      <Example
        className="grid max-w-md"
        code={`<NumberField label="Quantity" defaultValue={2} minValue={0} />
<NumberField
  label="Budget"
  defaultValue={1200}
  step={100}
  formatOptions={{ style: 'currency', currency: 'EUR' }}
/>`}
      >
        <NumberField label="Quantity" defaultValue={2} minValue={0} />
        <NumberField label="Budget" defaultValue={1200} step={100} formatOptions={{ style: 'currency', currency: 'EUR' }} />
      </Example>
    </Entry>
  );
}

export function SelectEntry() {
  return (
    <Entry id="select" title="Select">
      <Example
        className="grid max-w-md"
        code={`<Select label="Framework" placeholder="Choose one" defaultSelectedKey="react">
  <SelectItem id="react">React</SelectItem>
  <SelectItem id="vue">Vue</SelectItem>
  <SelectItem id="svelte">Svelte</SelectItem>
  <SelectItem id="solid">Solid</SelectItem>
</Select>

<Select label="Region" placeholder="Choose a region" animation="scale">
  <SelectItem id="eu">Europe</SelectItem>
  <SelectItem id="us">United States</SelectItem>
</Select>`}
      >
        <Select label="Framework" placeholder="Choose one" defaultSelectedKey="react">
          <SelectItem id="react">React</SelectItem>
          <SelectItem id="vue">Vue</SelectItem>
          <SelectItem id="svelte">Svelte</SelectItem>
          <SelectItem id="solid">Solid</SelectItem>
        </Select>
        <Select label="Region" placeholder="Choose a region" animation="scale">
          <SelectItem id="eu">Europe</SelectItem>
          <SelectItem id="us">United States</SelectItem>
        </Select>
      </Example>
    </Entry>
  );
}

export function CheckboxEntry() {
  return (
    <Entry id="checkbox" title="Checkbox">
      <Example
        code={`<Checkbox>Checkbox</Checkbox>
<Checkbox defaultSelected>Checked Checkbox</Checkbox>
<Checkbox isIndeterminate>Indeterminate</Checkbox>
<Checkbox isDisabled>Disabled</Checkbox>`}
      >
        <Checkbox>Checkbox</Checkbox>
        <Checkbox defaultSelected>Checked Checkbox</Checkbox>
        <Checkbox isIndeterminate>Indeterminate</Checkbox>
        <Checkbox isDisabled>Disabled</Checkbox>
      </Example>
    </Entry>
  );
}

export function CheckboxGroupEntry() {
  return (
    <Entry id="checkbox-group" title="CheckboxGroup">
      <Example
        code={`<CheckboxGroup label="Notifications" defaultValue={['email']}>
  <Checkbox value="email">Email</Checkbox>
  <Checkbox value="push">Push</Checkbox>
  <Checkbox value="sms" isDisabled>SMS (unavailable)</Checkbox>
</CheckboxGroup>`}
      >
        <CheckboxGroup label="Notifications" defaultValue={['email']}>
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="push">Push</Checkbox>
          <Checkbox value="sms" isDisabled>
            SMS (unavailable)
          </Checkbox>
        </CheckboxGroup>
      </Example>
    </Entry>
  );
}

export function RadioGroupEntry() {
  return (
    <Entry id="radio-group" title="RadioGroup">
      <Example
        className="flex-col items-start gap-6"
        code={`<RadioGroup label="Plan" defaultValue="pro" orientation="horizontal">
  <Radio value="free">Radio Button</Radio>
  <Radio value="pro">Selected Radio Button</Radio>
</RadioGroup>

<RadioGroup label="Delivery" defaultValue="standard">
  <Radio value="standard">Standard</Radio>
  <Radio value="express">Express</Radio>
</RadioGroup>`}
      >
        <RadioGroup label="Plan" defaultValue="pro" orientation="horizontal">
          <Radio value="free">Radio Button</Radio>
          <Radio value="pro">Selected Radio Button</Radio>
        </RadioGroup>
        <RadioGroup label="Delivery" defaultValue="standard">
          <Radio value="standard">Standard</Radio>
          <Radio value="express">Express</Radio>
        </RadioGroup>
      </Example>
    </Entry>
  );
}

export function SwitchEntry() {
  return (
    <Entry id="switch" title="Switch">
      <Example
        className="gap-6"
        code={`<Switch>Setting Off</Switch>
<Switch defaultSelected>Setting On</Switch>
<Switch size="sm" defaultSelected>Small</Switch>`}
      >
        <Switch>Setting Off</Switch>
        <Switch defaultSelected>Setting On</Switch>
        <Switch size="sm" defaultSelected>
          Small
        </Switch>
      </Example>
    </Entry>
  );
}

export function SliderEntry() {
  return (
    <Entry id="slider" title="Slider">
      <Example
        className="grid max-w-md gap-6"
        code={`<Slider label="Slider Fill" defaultValue={50} />
<Slider
  label="Price range"
  defaultValue={[20, 70]}
  thumbLabels={['Minimum', 'Maximum']}
  formatOptions={{ style: 'currency', currency: 'USD' }}
/>
<Slider aria-label="Plain slider" defaultValue={0} showFill={false} />`}
      >
        <Slider label="Slider Fill" defaultValue={50} />
        <Slider label="Price range" defaultValue={[20, 70]} thumbLabels={['Minimum', 'Maximum']} formatOptions={{ style: 'currency', currency: 'USD' }} />
        <Slider aria-label="Plain slider" defaultValue={0} showFill={false} />
      </Example>
    </Entry>
  );
}

export function FieldPartsEntry() {
  return (
    <Entry id="field-parts" title="Label, Input, Description, FieldError">
      <Example
        className="grid max-w-md"
        code={`import { TextField } from 'react-aria-components';
import { Description, FieldError, Input, Label, inputFrame } from 'krts.ui';

<TextField isRequired className="flex flex-col gap-1.5">
  <Label>Workspace URL</Label>
  <div className={inputFrame + ' h-12'}>
    <span className="pl-3.5 text-fg-subtle">krts.app/</span>
    <Input placeholder="acme" className="pl-0.5" />
  </div>
  <Description>Letters, numbers and dashes.</Description>
  <FieldError />
</TextField>`}
      >
        <RACTextField isRequired className="flex flex-col gap-1.5">
          <Label>Workspace URL</Label>
          <div className={inputFrame + ' h-12'}>
            <span className="pl-3.5 text-fg-subtle">krts.app/</span>
            <Input placeholder="acme" className="pl-0.5" />
          </div>
          <Description>Letters, numbers and dashes.</Description>
          <FieldError />
        </RACTextField>
      </Example>
    </Entry>
  );
}
