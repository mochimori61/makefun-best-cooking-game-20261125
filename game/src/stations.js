// stations.js — the two hot stations of the pho stall.
// Blanch baskets: wire baskets dunked in the rolling boil pot. Noodles
// need a quick dip; beef slices need longer until well-done. Pull either
// too late and it goes mushy (still usable, but the bowl loses quality).
// Broth pot: a temperature needle sweeps while you hold the pour; stop
// the ladle inside the ticket's band for a perfect pour.

export const BLANCH_TIME = { noodle: 3.0, beef: 5.0 };
export const OVERCOOK_AFTER = 4.0; // seconds past done before mushy

export class BlanchPot {
  constructor() {
    this.baskets = [null, null]; // {kind:'noodle'|'beef', t} or null
  }

  freeBasket() {
    return this.baskets.indexOf(null);
  }

  dunk(kind) {
    const i = this.freeBasket();
    if (i < 0) return false;
    this.baskets[i] = { kind, t: 0 };
    return true;
  }

  tick(dt) {
    for (const b of this.baskets) if (b) b.t += dt;
  }

  stateOf(b) {
    if (!b) return 'empty';
    if (b.t < BLANCH_TIME[b.kind]) return 'cooking';
    if (b.t < BLANCH_TIME[b.kind] + OVERCOOK_AFTER) return 'done';
    return 'mushy';
  }

  // Take basket i out; returns {kind, mushy} or null.
  lift(i) {
    const b = this.baskets[i];
    if (!b || this.stateOf(b) === 'cooking') return null;
    this.baskets[i] = null;
    return { kind: b.kind, mushy: this.stateOf(b) === 'mushy' };
  }
}

export class BrothPot {
  constructor() {
    this.pouring = false;
    this.temp = 62;      // needle position while sweeping
    this.dir = 1;
    this.pouredTemp = null; // locked temperature of the current bowl
  }

  startPour() {
    this.pouring = true;
    this.temp = 62;
    this.dir = 1;
  }

  tick(dt) {
    if (!this.pouring) return;
    this.temp += this.dir * dt * 26; // sweeps 62..100 C
    if (this.temp >= 100) { this.temp = 100; this.dir = -1; }
    if (this.temp <= 62) { this.temp = 62; this.dir = 1; }
  }

  // Stop the ladle; judge the temperature against the ticket band.
  stopPour(lo, hi) {
    this.pouring = false;
    this.pouredTemp = Math.round(this.temp);
    if (this.pouredTemp >= lo && this.pouredTemp <= hi) return 'perfect';
    if (this.pouredTemp >= lo - 6 && this.pouredTemp <= hi + 6) return 'ok';
    return 'bad';
  }

  reset() {
    this.pouring = false;
    this.pouredTemp = null;
  }
}

// Judge a finished bowl against its ticket. Returns a verdict object.
export function judgeBowl(bowl, ticket) {
  const r = ticket.recipe;
  const miss = [];
  if (!bowl.noodles) miss.push('noodles');
  const beefHave = bowl.beefRaw && bowl.beefDone ? 'mixed'
    : bowl.beefRaw ? 'raw' : bowl.beefDone ? 'done' : 'none';
  if (beefHave !== r.beef) miss.push('beef');
  const want = {};
  for (const h of r.herbs) want[h] = (want[h] || 0) + 1;
  for (const id of Object.keys(want)) {
    if ((bowl.herbs[id] || 0) < want[id]) miss.push(id);
  }
  for (const id of Object.keys(bowl.herbs)) {
    if (bowl.herbs[id] > (want[id] || 0)) miss.push('extra ' + id);
  }
  if (!bowl.broth) miss.push('broth');
  return { ok: miss.length === 0, miss };
}
