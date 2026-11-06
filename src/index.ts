// Utilities
export { cn, composeTw, focusRing } from './lib/cn';
export { KRTS_EVENTS, dispatchKrtsEvent, type KrtsEventName } from './lib/dom-events';
export { KrtsProvider, useKrtsConfig, type KrtsConfig, type OverlayAnimation } from './lib/config';

// Hooks
export {
  useGesture,
  useGestureHandlers,
  type GestureOptions,
  type GesturePointerType,
  type HoldGestureEvent,
  type SwipeDirection,
  type SwipeGestureEvent,
  type TapGestureEvent,
  type UseGestureResult,
} from './hooks/useGesture';
export { usePerceivedProgress, usePrefersReducedMotion, useSmoothPending } from './hooks/usePerceived';
export { useAnimatedWidth, type AnimatedWidthOptions } from './hooks/useAnimatedWidth';

// Components
export { Button, buttonStyles, type ButtonProps, type ButtonSize, type ButtonVariant } from './components/Button';
export { HoldButton, type HoldButtonProps, type HoldButtonVariant } from './components/HoldButton';
export { CopyButton, type CopyButtonProps } from './components/CopyButton';
export { GestureArea, type GestureAreaProps } from './components/GestureArea';
export { Spinner, type SpinnerProps } from './components/Spinner';
export { ToggleButton, SegmentedControl, Segment, type ToggleButtonProps, type SegmentedControlProps } from './components/ToggleButton';
export {
  DropdownButton,
  SplitButton,
  type DropdownButtonProps,
  type SplitButtonProps,
} from './components/DropdownButton';
export {
  Menu,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
  SubmenuTrigger,
  type MenuItemProps,
  type MenuProps,
  type MenuSectionProps,
} from './components/Menu';
export { Popover, floatingMotion, floatingSurface, type PopoverProps } from './components/Popover';
export { Tooltip, TooltipTrigger, WithTooltip, type TooltipProps, type TooltipTriggerProps } from './components/Tooltip';
export {
  Description,
  FieldError,
  Input,
  Label,
  NumberField,
  SearchField,
  TextAreaField,
  TextField,
  inputFrame,
  type NumberFieldProps,
  type SearchFieldProps,
  type TextAreaFieldProps,
  type TextFieldProps,
} from './components/Field';
export { Checkbox, CheckboxGroup, type CheckboxGroupProps, type CheckboxProps } from './components/Checkbox';
export { Radio, RadioGroup, type RadioGroupProps } from './components/Radio';
export { Switch, type SwitchProps } from './components/Switch';
export { Slider, type SliderProps } from './components/Slider';
export { Select, SelectItem, type SelectProps } from './components/Select';
export { AlertDialog, Dialog, DialogTrigger, Drawer, Modal, type AlertDialogProps, type DialogProps, type DrawerProps, type ModalProps } from './components/Dialog';
export { Tab, TabList, TabPanel, Tabs, type TabProps, type TabsProps } from './components/Tabs';
export { Meter, ProgressBar, type MeterProps, type ProgressBarProps } from './components/Progress';
export { Accordion, Disclosure, type DisclosureProps } from './components/Disclosure';
export { Toaster, toast, type ToastAction, type ToastOptions, type ToasterProps, type ToastType } from './components/Toast';
export {
  Avatar,
  Badge,
  Card,
  CardHeader,
  Kbd,
  Link,
  Separator,
  Skeleton,
  type AvatarProps,
  type BadgeProps,
  type SkeletonProps,
} from './components/Display';
export * from './components/icons';
