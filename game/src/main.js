// main.js — Pho Saigon Morning: the shift loop.
// Take a ticket, dip the noodles, lay the beef (raw for the broth to
// cook, or blanched well-done), pick the herbs, pour broth inside the
// ticket's temperature band, and serve before patience runs out.
// Three strikes or the end of the 180-second shift ends the morning.
//
// Screenshot mode: ?shot=cover|rush|serve&seed=N builds one frozen,
// fully staged scene (order board full, a bowl mid-assembly, timers
// visible, a finished bowl on the pass) and draws it once, statically.

import { OrderBoard, makeRng } from './orders.js';
import { BlanchPot, BrothPot, judgeBowl } from './stations.js';
import { drawScene } from './render.js';
import { attachInput } from './input.js';
import { RECIPES } from './recipes.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const SHIFT_SECONDS = 180;

function emptyBowl() {
  return {
    noodles: false, beefRaw: false, beefDone: false,
    herbs: {}, broth: null, brothTemp: null, mushy: false,
  };
}

function freshState(seed) {
  const rng = makeRng(seed);
  return {
    mode: 'play', shot: null,
    timeLeft: SHIFT_SECONDS, elapsed: 0,
    coins: 0, strikes: 0,
    board: new OrderBoard(rng),
    pot: new BlanchPot(),
    broth: new BrothPot(),
    bowl: emptyBowl(),
    passBowl: null, passTimer: 0,
    flash: '', flashTimer: 0,
  };
}

let state = freshState(20261125);
state.board.spawn();
state.board.spawn();

function say(msg) {
  state.flash = msg;
  state.flashTimer = 2.6; // long enough to read mid-rush
}

function resetBowl() {
  state.bowl = emptyBowl();
  state.broth.reset();
}

function serve() {
  if (state.mode === 'over') { state = freshState(20261125); state.board.spawn(); return; }
  const ticket = state.board.front();
  if (!ticket) { say('No ticket on the board yet.'); return; }
  const verdict = judgeBowl(state.bowl, ticket);
  if (!verdict.ok) {
    say('Not yet — missing: ' + verdict.miss.join(', '));
    return;
  }
  if (state.bowl.broth === 'bad') {
    state.strikes++;
    say(`Broth at ${state.bowl.brothTemp}C — customer sent it back! Strike.`);
    resetBowl();
    return;
  }
  let pay = ticket.recipe.price;
  pay += Math.round(8 * (ticket.patience / ticket.patienceMax));
  if (state.bowl.broth === 'perfect') pay += 4;
  if (state.bowl.mushy) pay = Math.max(4, pay - 5);
  state.coins += pay;
  state.passBowl = { bowl: state.bowl, name: `${ticket.recipe.name} · +${pay}c` };
  state.passTimer = 4;
  state.board.removeFront();
  say(`${ticket.recipe.name} served! +${pay} coins`);
  resetBowl();
  if (state.strikes >= 3) state.mode = 'over';
}

function trash() {
  if (state.mode !== 'play') return;
  resetBowl();
  say('Bowl trashed. Start fresh.');
}

function zone(id) {
  if (state.mode === 'over') {
    if (id === 'restart') { state = freshState(20261125); state.board.spawn(); }
    return;
  }
  if (id === 'bin-noodle') {
    if (!state.pot.dunk('noodle')) say('Both baskets are busy!');
  } else if (id === 'bin-beefbasket') {
    if (!state.pot.dunk('beef')) say('Both baskets are busy!');
  } else if (id === 'bin-beefraw') {
    if (state.bowl.beefRaw) say('Raw beef already laid.');
    else state.bowl.beefRaw = true;
  } else if (id.startsWith('herb-')) {
    const herb = id.slice(5);
    state.bowl.herbs[herb] = (state.bowl.herbs[herb] || 0) + 1;
  } else if (id === 'basket-0' || id === 'basket-1') {
    const i = id === 'basket-0' ? 0 : 1;
    const st = state.pot.stateOf(state.pot.baskets[i]);
    if (st === 'cooking') { say('Still dipping — wait for the ring to fill.'); return; }
    const lifted = state.pot.lift(i);
    if (!lifted) return;
    if (lifted.kind === 'noodle') {
      if (state.bowl.noodles) say('Noodles already in the bowl.');
      else { state.bowl.noodles = true; if (lifted.mushy) state.bowl.mushy = true; }
    } else {
      if (state.bowl.beefDone) say('Well-done beef already in.');
      else { state.bowl.beefDone = true; if (lifted.mushy) state.bowl.mushy = true; }
    }
  } else if (id === 'broth') {
    if (state.bowl.broth) { say('Broth already poured — serve or trash.'); return; }
    if (!state.broth.pouring) {
      state.broth.startPour();
      say('Pouring… click the pot again to stop in the green band!');
    } else {
      const ticket = state.board.front();
      const lo = ticket ? ticket.recipe.brothLo : 84;
      const hi = ticket ? ticket.recipe.brothHi : 90;
      const quality = state.broth.stopPour(lo, hi);
      state.bowl.broth = quality;
      state.bowl.brothTemp = state.broth.pouredTemp;
      say(quality === 'perfect' ? `Perfect pour at ${state.bowl.brothTemp}C!`
        : quality === 'ok' ? `Poured at ${state.bowl.brothTemp}C — close enough.`
        : `Poured at ${state.bowl.brothTemp}C — off temperature!`);
    }
  } else if (id === 'serve') {
    serve();
  } else if (id === 'trash') {
    trash();
  }
}

// ---------- deterministic screenshot scenes ----------
function shotState(kind, seed) {
  const s = freshState(seed);
  s.mode = 'shot';
  s.shot = kind;
  s.board.tickets = [];
  const picks = kind === 'rush' ? [3, 0, 2] : [0, 2, 1];
  picks.forEach((ri, i) => {
    const r = RECIPES[ri];
    const patienceMax = r.patience;
    const patience = kind === 'rush' && i === 0 ? 9
      : Math.round(patienceMax * (0.85 - i * 0.22));
    s.board.tickets.push({ id: i + 1, recipe: r, patience, patienceMax, face: (seed + i) % 4 });
  });
  // a bowl mid-assembly on the counter
  s.bowl.noodles = true;
  s.bowl.beefRaw = true;
  s.bowl.herbs = { basil: 1, sprouts: 1 };
  // baskets mid-work with their timer rings showing
  s.pot.baskets[0] = { kind: 'noodle', t: 1.8 };
  s.pot.baskets[1] = { kind: 'beef', t: kind === 'rush' ? 9.6 : 5.4 };
  // a finished bowl waiting on the pass
  const passBowl = emptyBowl();
  passBowl.noodles = true;
  passBowl.beefDone = true;
  passBowl.herbs = { cilantro: 1, onion: 1, lime: 1 };
  passBowl.broth = 'perfect';
  passBowl.brothTemp = 85;
  s.passBowl = { bowl: passBowl, name: 'Pho Chin · ready' };
  if (kind === 'cover') {
    s.timeLeft = 142; s.coins = 36;
  } else if (kind === 'rush') {
    s.timeLeft = 47; s.coins = 118; s.strikes = 1;
    s.flash = 'Rush hour — tickets stacking up!';
  } else { // serve
    s.timeLeft = 96; s.coins = 74;
    s.bowl.herbs = { basil: 1, sprouts: 1, onion: 1 };
    s.bowl.broth = 'perfect';
    s.bowl.brothTemp = 89;
    s.broth.pouredTemp = 89;
    s.flash = 'Perfect pour at 89C — serve it!';
  }
  return s;
}

const params = new URLSearchParams(location.search);
if (params.get('shot')) {
  state = shotState(params.get('shot'), Number(params.get('seed') || 7));
  drawScene(ctx, state);
} else {
  attachInput(canvas, { zone, serve, trash });
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (state.mode === 'play') {
      state.elapsed += dt;
      state.timeLeft -= dt;
      state.pot.tick(dt);
      state.broth.tick(dt);
      const difficulty = state.elapsed / 30;
      const expired = state.board.tick(dt, difficulty);
      if (expired > 0) {
        state.strikes += expired;
        say(expired === 1 ? 'A customer walked out! Strike.' : `${expired} customers walked out!`);
      }
      if (state.passTimer > 0) {
        state.passTimer -= dt;
        if (state.passTimer <= 0) state.passBowl = null;
      }
      if (state.flashTimer > 0) {
        state.flashTimer -= dt;
        if (state.flashTimer <= 0) state.flash = '';
      }
      if (state.strikes >= 3 || state.timeLeft <= 0) state.mode = 'over';
    }
    drawScene(ctx, state);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
