// orders.js — the order board: ticket spawning, patience, expiry.
// Tickets arrive on a rail; the front ticket is the one the bowl on the
// counter should match. Patience drains in real time and faster late in
// the shift.

import { RECIPES } from './recipes.js';

// Small deterministic RNG so screenshot scenes are reproducible.
export function makeRng(seed) {
  let a = (seed >>> 0) || 1;
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class OrderBoard {
  constructor(rng) {
    this.rng = rng;
    this.tickets = [];
    this.nextId = 1;
    this.spawnIn = 0; // seconds until the next customer walks up
  }

  spawn(patienceScale = 1) {
    const r = RECIPES[Math.floor(this.rng() * RECIPES.length)];
    const patience = Math.round(r.patience * patienceScale);
    this.tickets.push({
      id: this.nextId++,
      recipe: r,
      patience,
      patienceMax: patience,
      face: Math.floor(this.rng() * 4), // which customer portrait to draw
    });
  }

  // Advance the board; returns how many tickets walked out angry.
  tick(dt, difficulty) {
    let expired = 0;
    for (const t of this.tickets) t.patience -= dt;
    const before = this.tickets.length;
    this.tickets = this.tickets.filter((t) => t.patience > 0);
    expired = before - this.tickets.length;

    this.spawnIn -= dt;
    if (this.spawnIn <= 0 && this.tickets.length < 4) {
      this.spawn(Math.max(0.55, 1 - difficulty * 0.05));
      this.spawnIn = Math.max(3.2, 8.5 - difficulty * 0.7) + this.rng() * 2.5;
    }
    return expired;
  }

  front() {
    return this.tickets[0] || null;
  }

  removeFront() {
    this.tickets.shift();
  }
}
