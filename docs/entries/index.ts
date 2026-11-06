import type { ComponentType } from 'react';
import { ButtonEntry, CopyButtonEntry, DropdownButtonEntry, HoldButtonEntry, SplitButtonEntry, ToggleButtonEntry } from './actions';
import { AvatarEntry, BadgeEntry, CardEntry, IconsEntry, KbdEntry, SeparatorEntry } from './display';
import { MeterEntry, ProgressBarEntry, SkeletonEntry, SpinnerEntry, ToastEntry } from './feedback';
import {
  CheckboxEntry,
  CheckboxGroupEntry,
  FieldPartsEntry,
  NumberFieldEntry,
  RadioGroupEntry,
  SearchFieldEntry,
  SelectEntry,
  SliderEntry,
  SwitchEntry,
  TextAreaFieldEntry,
  TextFieldEntry,
} from './forms';
import { ButtonGesturesEntry, GestureAreaEntry, UseGestureEntry } from './gestures';
import {
  KrtsProviderEntry,
  StylingUtilitiesEntry,
  UseAnimatedWidthEntry,
  UsePerceivedProgressEntry,
  UsePrefersReducedMotionEntry,
  UseSmoothPendingEntry,
} from './hooks';
import { AccordionEntry, LinkEntry, SegmentedControlEntry, TabsEntry } from './navigation';
import { AlertDialogEntry, DialogEntry, DrawerEntry, MenuEntry, ModalEntry, PopoverEntry, TooltipEntry } from './overlays';

export interface DocEntry {
  /** Must match the `id` the entry component renders. */
  id: string;
  title: string;
  Component: ComponentType;
}

export interface DocGroup {
  id: string;
  title: string;
  entries: DocEntry[];
}

export const groups: DocGroup[] = [
  {
    id: 'actions',
    title: 'Actions',
    entries: [
      { id: 'button', title: 'Button', Component: ButtonEntry },
      { id: 'hold-button', title: 'HoldButton', Component: HoldButtonEntry },
      { id: 'copy-button', title: 'CopyButton', Component: CopyButtonEntry },
      { id: 'toggle-button', title: 'ToggleButton', Component: ToggleButtonEntry },
      { id: 'dropdown-button', title: 'DropdownButton', Component: DropdownButtonEntry },
      { id: 'split-button', title: 'SplitButton', Component: SplitButtonEntry },
    ],
  },
  {
    id: 'gestures',
    title: 'Gestures',
    entries: [
      { id: 'gesture-area', title: 'GestureArea', Component: GestureAreaEntry },
      { id: 'button-gestures', title: 'Gestures on Button', Component: ButtonGesturesEntry },
      { id: 'use-gesture', title: 'useGesture', Component: UseGestureEntry },
    ],
  },
  {
    id: 'overlays',
    title: 'Overlays',
    entries: [
      { id: 'tooltip', title: 'Tooltip', Component: TooltipEntry },
      { id: 'menu', title: 'Menu', Component: MenuEntry },
      { id: 'popover', title: 'Popover', Component: PopoverEntry },
      { id: 'dialog', title: 'Dialog', Component: DialogEntry },
      { id: 'alert-dialog', title: 'AlertDialog', Component: AlertDialogEntry },
      { id: 'modal', title: 'Modal', Component: ModalEntry },
      { id: 'drawer', title: 'Drawer', Component: DrawerEntry },
    ],
  },
  {
    id: 'forms',
    title: 'Forms',
    entries: [
      { id: 'text-field', title: 'TextField', Component: TextFieldEntry },
      { id: 'textarea-field', title: 'TextAreaField', Component: TextAreaFieldEntry },
      { id: 'search-field', title: 'SearchField', Component: SearchFieldEntry },
      { id: 'number-field', title: 'NumberField', Component: NumberFieldEntry },
      { id: 'select', title: 'Select', Component: SelectEntry },
      { id: 'checkbox', title: 'Checkbox', Component: CheckboxEntry },
      { id: 'checkbox-group', title: 'CheckboxGroup', Component: CheckboxGroupEntry },
      { id: 'radio-group', title: 'RadioGroup', Component: RadioGroupEntry },
      { id: 'switch', title: 'Switch', Component: SwitchEntry },
      { id: 'slider', title: 'Slider', Component: SliderEntry },
      { id: 'field-parts', title: 'Field parts', Component: FieldPartsEntry },
    ],
  },
  {
    id: 'navigation',
    title: 'Navigation',
    entries: [
      { id: 'tabs', title: 'Tabs', Component: TabsEntry },
      { id: 'segmented-control', title: 'SegmentedControl', Component: SegmentedControlEntry },
      { id: 'accordion', title: 'Accordion', Component: AccordionEntry },
      { id: 'link', title: 'Link', Component: LinkEntry },
    ],
  },
  {
    id: 'feedback',
    title: 'Feedback',
    entries: [
      { id: 'toast', title: 'Toast', Component: ToastEntry },
      { id: 'progress-bar', title: 'ProgressBar', Component: ProgressBarEntry },
      { id: 'meter', title: 'Meter', Component: MeterEntry },
      { id: 'spinner', title: 'Spinner', Component: SpinnerEntry },
      { id: 'skeleton', title: 'Skeleton', Component: SkeletonEntry },
    ],
  },
  {
    id: 'display',
    title: 'Display',
    entries: [
      { id: 'badge', title: 'Badge', Component: BadgeEntry },
      { id: 'avatar', title: 'Avatar', Component: AvatarEntry },
      { id: 'kbd', title: 'Kbd', Component: KbdEntry },
      { id: 'card', title: 'Card', Component: CardEntry },
      { id: 'separator', title: 'Separator', Component: SeparatorEntry },
      { id: 'icons', title: 'Icons', Component: IconsEntry },
    ],
  },
  {
    id: 'hooks',
    title: 'Hooks & config',
    entries: [
      { id: 'krts-provider', title: 'KrtsProvider', Component: KrtsProviderEntry },
      { id: 'use-smooth-pending', title: 'useSmoothPending', Component: UseSmoothPendingEntry },
      { id: 'use-perceived-progress', title: 'usePerceivedProgress', Component: UsePerceivedProgressEntry },
      { id: 'use-animated-width', title: 'useAnimatedWidth', Component: UseAnimatedWidthEntry },
      { id: 'use-prefers-reduced-motion', title: 'usePrefersReducedMotion', Component: UsePrefersReducedMotionEntry },
      { id: 'styling-utilities', title: 'Styling utilities', Component: StylingUtilitiesEntry },
    ],
  },
];
