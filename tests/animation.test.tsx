import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, DropdownButton, HoldButton, KrtsProvider, MenuItem, Select, SelectItem } from '../src';

const user = () => userEvent.setup({ delay: null });

function popover() {
  return document.querySelector('[data-animation]') as HTMLElement | null;
}

describe('menu animation', () => {
  it('defaults to a quick fade', async () => {
    render(
      <DropdownButton label="Actions">
        <MenuItem id="a">A</MenuItem>
      </DropdownButton>,
    );
    await user().click(screen.getByRole('button', { name: /actions/i }));
    expect(popover()).toHaveAttribute('data-animation', 'fade');
    expect(popover()!.className).not.toMatch(/scale-/);
  });

  it('accepts animation="scale" per component', async () => {
    render(
      <Select label="Fruit" animation="scale" defaultSelectedKey="a">
        <SelectItem id="a">Apple</SelectItem>
      </Select>,
    );
    await user().click(screen.getByRole('button'));
    expect(popover()).toHaveAttribute('data-animation', 'scale');
    expect(popover()!.className).toMatch(/entering:scale-/);
  });

  it('can be set app-wide with KrtsProvider, and a prop still wins', async () => {
    render(
      <KrtsProvider menuAnimation="none">
        <DropdownButton label="One">
          <MenuItem id="a">A</MenuItem>
        </DropdownButton>
        <DropdownButton label="Two" animation="scale">
          <MenuItem id="b">B</MenuItem>
        </DropdownButton>
      </KrtsProvider>,
    );
    const u = user();
    await u.click(screen.getByRole('button', { name: /one/i }));
    expect(popover()).toHaveAttribute('data-animation', 'none');
    await u.keyboard('{Escape}');
    await u.click(screen.getByRole('button', { name: /two/i }));
    expect(popover()).toHaveAttribute('data-animation', 'scale');
  });
});

describe('buttons do not scale', () => {
  it('Button and HoldButton have no scale classes', () => {
    render(
      <>
        <Button>Plain</Button>
        <HoldButton onConfirm={() => {}}>Hold</HoldButton>
      </>,
    );
    for (const b of screen.getAllByRole('button')) expect(b.className).not.toMatch(/scale-/);
  });
});
