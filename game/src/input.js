// input.js — mouse and keyboard for the pho stall.
// Clicks are resolved against the shared ZONES table from render.js.
// Keyboard: 1-9 pick from the bins, B toggles the broth pour, Space or
// Enter serves, Backspace trashes the bowl, Enter restarts after a shift.

import { ZONES } from './render.js';

export function zoneAt(x, y) {
  for (const z of ZONES) {
    if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) return z.id;
  }
  return null;
}

const KEY_TO_ZONE = {
  1: 'bin-noodle', 2: 'bin-beefbasket', 3: 'bin-beefraw',
  4: 'herb-basil', 5: 'herb-cilantro', 6: 'herb-sprouts',
  7: 'herb-lime', 8: 'herb-chili', 9: 'herb-onion',
};

export function attachInput(canvas, actions) {
  canvas.addEventListener('click', (ev) => {
    const rect = canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (canvas.width / rect.width);
    const y = (ev.clientY - rect.top) * (canvas.height / rect.height);
    const id = zoneAt(x, y);
    if (id) actions.zone(id);
  });
  window.addEventListener('keydown', (ev) => {
    if (ev.key === ' ' || ev.key === 'Enter') {
      ev.preventDefault();
      actions.serve();
    } else if (ev.key === 'Backspace') {
      ev.preventDefault();
      actions.trash();
    } else if (ev.key === 'b' || ev.key === 'B') {
      actions.zone('broth');
    } else if (KEY_TO_ZONE[ev.key]) {
      actions.zone(KEY_TO_ZONE[ev.key]);
    }
  });
}
