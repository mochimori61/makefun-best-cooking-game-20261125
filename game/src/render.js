// render.js — every pixel of Pho Saigon Morning is drawn here in code.
// Dawn-teal stall, herb-green accents: order rail on the left, blanch pot
// and broth pot in the middle, the assembly bowl front and centre, the
// pass on the right, and a row of ingredient bins along the counter.

import { HERBS, herbName } from './recipes.js';
import { BLANCH_TIME } from './stations.js';

export const W = 1280, H = 800;

// Click zones shared with input.js. ids are handled in main.js.
export const ZONES = [
  { id: 'basket-0', x: 356, y: 150, w: 82, h: 110 },
  { id: 'basket-1', x: 452, y: 150, w: 82, h: 110 },
  { id: 'broth',    x: 566, y: 120, w: 220, h: 170 },
  { id: 'serve',    x: 836, y: 470, w: 190, h: 62 },
  { id: 'trash',    x: 1046, y: 470, w: 190, h: 62 },
  { id: 'restart',  x: 490, y: 470, w: 300, h: 70 },
];
// Ingredient bins along the bottom counter, filled in below.
const BIN_DEFS = [
  { id: 'bin-noodle', label: 'Noodle Dip', key: '1' },
  { id: 'bin-beefbasket', label: 'Beef Dip', key: '2' },
  { id: 'bin-beefraw', label: 'Raw Beef', key: '3' },
  { id: 'herb-basil', label: 'Basil', key: '4', herb: 'basil' },
  { id: 'herb-cilantro', label: 'Cilantro', key: '5', herb: 'cilantro' },
  { id: 'herb-sprouts', label: 'Sprouts', key: '6', herb: 'sprouts' },
  { id: 'herb-lime', label: 'Lime', key: '7', herb: 'lime' },
  { id: 'herb-chili', label: 'Chili', key: '8', herb: 'chili' },
  { id: 'herb-onion', label: 'Onion', key: '9', herb: 'onion' },
];
BIN_DEFS.forEach((b, i) => {
  ZONES.push({ id: b.id, x: 16 + i * 140, y: 640, w: 128, h: 130 });
});

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function text(ctx, s, x, y, size, color, align = 'left', bold = false) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? '700 ' : ''}${size}px Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

const FACES = ['#f2c894', '#e8b07e', '#d99e63', '#c98d54'];
const SHIRTS = ['#c94f38', '#2e7f9e', '#5b8c3e', '#7a4f9e'];

function drawBackground(ctx, state) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0e4d5c');
  sky.addColorStop(0.45, '#17707f');
  sky.addColorStop(1, '#0b3542');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // dawn glow on the horizon
  const glow = ctx.createRadialGradient(1080, 120, 20, 1080, 120, 340);
  glow.addColorStop(0, 'rgba(255,196,110,0.55)');
  glow.addColorStop(1, 'rgba(255,196,110,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  // awning stripes
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 ? '#e8f3e4' : '#1f8a70';
    ctx.beginPath();
    ctx.moveTo(i * 80, 0); ctx.lineTo(i * 80 + 80, 0);
    ctx.lineTo(i * 80 + 64, 46); ctx.lineTo(i * 80 + 16, 46);
    ctx.closePath(); ctx.fill();
  }
  // street + counter
  ctx.fillStyle = '#123f36';
  ctx.fillRect(0, 560, W, 240);
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(0, 560, W, 18);
  ctx.fillStyle = '#a06a3a';
  ctx.fillRect(0, 578, W, 8);
  // hanging lanterns
  for (const lx of [120, 640, 1160]) {
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.moveTo(lx, 46); ctx.lineTo(lx, 74); ctx.stroke();
    ctx.fillStyle = '#ffb84d';
    ctx.beginPath(); ctx.ellipse(lx, 92, 17, 21, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,220,150,0.85)';
    ctx.beginPath(); ctx.ellipse(lx, 92, 9, 12, 0, 0, Math.PI * 2); ctx.fill();
  }
}

function drawHud(ctx, state) {
  ctx.fillStyle = 'rgba(4,32,38,0.88)';
  ctx.fillRect(0, 46, W, 52);
  text(ctx, 'PHO SAIGON MORNING', 18, 72, 24, '#ffd98a', 'left', true);
  const t = Math.max(0, Math.ceil(state.timeLeft));
  const mm = Math.floor(t / 60), ss = String(t % 60).padStart(2, '0');
  text(ctx, `SHIFT ${mm}:${ss}`, 640, 72, 30, t <= 30 ? '#ff7a5c' : '#ffffff', 'center', true);
  text(ctx, `COINS ${state.coins}`, 1050, 72, 24, '#ffd98a', 'right', true);
  // strikes as red chilis
  for (let i = 0; i < 3; i++) {
    const x = 1090 + i * 52;
    ctx.fillStyle = i < state.strikes ? '#d93b2b' : 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.ellipse(x, 72, 16, 8, -0.5, 0, Math.PI * 2); ctx.fill();
  }
  text(ctx, 'MISS', 1248, 72, 13, '#ffb0a0', 'right');
}

function drawTicket(ctx, t, x, y, isFront) {
  const w = 284, h = 118;
  ctx.fillStyle = isFront ? '#fff8e6' : '#e9e2cd';
  rr(ctx, x, y, w, h, 8); ctx.fill();
  ctx.strokeStyle = isFront ? '#e8a13a' : '#9a8f6d';
  ctx.lineWidth = isFront ? 3 : 1;
  rr(ctx, x, y, w, h, 8); ctx.stroke();
  // customer portrait
  ctx.fillStyle = FACES[t.face];
  ctx.beginPath(); ctx.arc(x + 34, y + 36, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = SHIRTS[t.face];
  rr(ctx, x + 14, y + 56, 40, 26, 6); ctx.fill();
  text(ctx, `#${t.id} ${t.recipe.name}`, x + 64, y + 24, 19, '#263238', 'left', true);
  text(ctx, t.recipe.sub, x + 64, y + 47, 13, '#5d6d66');
  const herbTxt = t.recipe.herbs.map(herbName).join(' · ');
  text(ctx, herbTxt, x + 64, y + 76, 12, '#37474f');
  text(ctx, `broth ${t.recipe.brothLo}-${t.recipe.brothHi}C · ${t.recipe.price}c`,
    x + 12, y + 96, 12.5, '#6d4c00');
  // patience bar
  const frac = Math.max(0, t.patience / t.patienceMax);
  ctx.fillStyle = '#c9c2ab';
  rr(ctx, x + 150, y + 88, 122, 13, 6); ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#3f9e4d' : frac > 0.25 ? '#e8a13a' : '#d93b2b';
  rr(ctx, x + 150, y + 88, Math.max(8, 122 * frac), 13, 6); ctx.fill();
}

function drawBoard(ctx, state) {
  ctx.fillStyle = 'rgba(6,40,44,0.75)';
  rr(ctx, 10, 108, 308, 442, 10); ctx.fill();
  text(ctx, 'ORDER BOARD', 164, 128, 19, '#ffd98a', 'center', true);
  state.board.tickets.forEach((t, i) => {
    drawTicket(ctx, t, 22, 148 + i * 128, i === 0);
  });
  if (!state.board.tickets.length) {
    text(ctx, 'waiting for customers…', 164, 320, 16, '#bfe3d8', 'center');
  }
}

function drawBowlContents(ctx, bowl, cx, cy, scale) {
  // broth surface
  if (bowl.broth) {
    ctx.fillStyle = bowl.broth === 'bad' ? '#7a5c33' : '#c98d3e';
    ctx.beginPath(); ctx.ellipse(cx, cy, 118 * scale, 44 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,230,170,0.5)';
    ctx.beginPath(); ctx.ellipse(cx - 30 * scale, cy - 8 * scale, 52 * scale, 15 * scale, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = '#fdf6e3';
    ctx.beginPath(); ctx.ellipse(cx, cy, 118 * scale, 44 * scale, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (bowl.noodles) {
    ctx.strokeStyle = '#f5eeda';
    ctx.lineWidth = 3 * scale;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * 44 * scale, cy + Math.sin(a) * 13 * scale,
        30 * scale, 9 * scale, a * 0.3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  if (bowl.beefDone) {
    ctx.fillStyle = '#8a5a33';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(cx - 52 * scale + i * 30 * scale, cy + 12 * scale, 15 * scale, 8 * scale, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (bowl.beefRaw) {
    ctx.fillStyle = '#e88ca0';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(cx - 40 * scale + i * 28 * scale, cy - 16 * scale, 14 * scale, 7 * scale, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(190,60,80,0.6)';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(cx - 40 * scale + i * 28 * scale, cy - 16 * scale, 6 * scale, 3 * scale, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // herbs scattered on top
  let n = 0;
  for (const h of HERBS) {
    const count = bowl.herbs[h.id] || 0;
    for (let k = 0; k < count; k++) {
      const a = (n * 2.39) % (Math.PI * 2);
      const rad = 26 + ((n * 37) % 60);
      const hx = cx + Math.cos(a) * rad * scale;
      const hy = cy + Math.sin(a) * rad * 0.36 * scale;
      ctx.fillStyle = h.color;
      if (h.id === 'lime') {
        ctx.beginPath(); ctx.arc(hx, hy, 9 * scale, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#dff0a8';
        ctx.beginPath(); ctx.arc(hx, hy, 5 * scale, 0, Math.PI * 2); ctx.fill();
      } else if (h.id === 'chili') {
        ctx.beginPath(); ctx.ellipse(hx, hy, 10 * scale, 4 * scale, 0.7, 0, Math.PI * 2); ctx.fill();
      } else if (h.id === 'sprouts') {
        ctx.fillRect(hx - 7 * scale, hy - 2 * scale, 14 * scale, 3.4 * scale);
      } else {
        ctx.beginPath(); ctx.ellipse(hx, hy, 8 * scale, 5 * scale, a, 0, Math.PI * 2); ctx.fill();
      }
      n++;
    }
  }
}

function drawBowl(ctx, bowl, cx, cy, scale) {
  ctx.fillStyle = '#f4f1e6';
  ctx.beginPath(); ctx.ellipse(cx, cy + 16 * scale, 132 * scale, 52 * scale, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(cx, cy, 130 * scale, 48 * scale, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#1f8a70';
  ctx.lineWidth = 4 * scale;
  ctx.beginPath(); ctx.ellipse(cx, cy, 130 * scale, 48 * scale, 0, 0, Math.PI * 2); ctx.stroke();
  drawBowlContents(ctx, bowl, cx, cy, scale);
  // chopsticks
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 5 * scale;
  ctx.beginPath();
  ctx.moveTo(cx + 60 * scale, cy - 40 * scale); ctx.lineTo(cx + 128 * scale, cy - 84 * scale);
  ctx.moveTo(cx + 78 * scale, cy - 30 * scale); ctx.lineTo(cx + 142 * scale, cy - 66 * scale);
  ctx.stroke();
}

function drawStations(ctx, state) {
  // ---- blanch pot
  ctx.fillStyle = 'rgba(6,40,44,0.75)';
  rr(ctx, 336, 108, 224, 196, 10); ctx.fill();
  text(ctx, 'BLANCH POT', 448, 128, 17, '#ffd98a', 'center', true);
  ctx.fillStyle = '#274b63';
  rr(ctx, 348, 268, 200, 26, 8); ctx.fill();
  ctx.fillStyle = '#7fd4e8';
  ctx.beginPath(); ctx.ellipse(448, 268, 98, 12, 0, 0, Math.PI * 2); ctx.fill();
  state.pot.baskets.forEach((b, i) => {
    const zx = ZONES[i];
    ctx.fillStyle = b ? '#caa46a' : '#5d7a72';
    rr(ctx, zx.x, zx.y, zx.w, zx.h, 8); ctx.fill();
    ctx.strokeStyle = '#2c4a42'; ctx.lineWidth = 2;
    rr(ctx, zx.x, zx.y, zx.w, zx.h, 8); ctx.stroke();
    if (!b) {
      text(ctx, 'empty', zx.x + zx.w / 2, zx.y + zx.h / 2, 13, '#d8e8e0', 'center');
      return;
    }
    ctx.fillStyle = b.kind === 'noodle' ? '#f5eeda' : '#a06a3a';
    ctx.beginPath();
    ctx.ellipse(zx.x + zx.w / 2, zx.y + 62, 30, 16, 0, 0, Math.PI * 2); ctx.fill();
    text(ctx, b.kind === 'noodle' ? 'NOODLE' : 'BEEF', zx.x + zx.w / 2, zx.y + 24, 12, '#20312b', 'center', true);
    // timer ring
    const st = state.pot.stateOf(b);
    const frac = Math.min(1, b.t / BLANCH_TIME[b.kind]);
    ctx.strokeStyle = st === 'done' ? '#3f9e4d' : st === 'mushy' ? '#d93b2b' : '#e8a13a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(zx.x + zx.w / 2, zx.y + 92, 13, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    ctx.stroke();
    if (st !== 'cooking') text(ctx, st.toUpperCase(), zx.x + zx.w / 2, zx.y + 92, 10, '#20312b', 'center', true);
  });
  text(ctx, 'click a ready basket to lift it into the bowl', 448, 318, 12.5, '#bfe3d8', 'center');

  // ---- broth pot
  ctx.fillStyle = 'rgba(6,40,44,0.75)';
  rr(ctx, 576, 108, 224, 196, 10); ctx.fill();
  text(ctx, 'BROTH POT', 688, 128, 17, '#ffd98a', 'center', true);
  const bz = ZONES[2];
  ctx.fillStyle = '#3d3d46';
  rr(ctx, bz.x, bz.y + 40, bz.w, bz.h - 40, 12); ctx.fill();
  const brothGrad = ctx.createLinearGradient(0, bz.y + 50, 0, bz.y + bz.h);
  brothGrad.addColorStop(0, '#d99a44'); brothGrad.addColorStop(1, '#9c6423');
  ctx.fillStyle = brothGrad;
  ctx.beginPath(); ctx.ellipse(bz.x + bz.w / 2, bz.y + 56, bz.w / 2 - 12, 20, 0, 0, Math.PI * 2); ctx.fill();
  // steam
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    const sx = bz.x + 50 + i * 60;
    ctx.beginPath();
    ctx.moveTo(sx, bz.y + 34);
    ctx.bezierCurveTo(sx - 8, bz.y + 16, sx + 8, bz.y + 8, sx, bz.y - 6);
    ctx.stroke();
  }
  text(ctx, state.broth.pouring ? 'POURING…' : 'click pot: start / stop pour',
    688, 318, 12.5, '#bfe3d8', 'center');
  // temperature gauge
  const gx = 816, gy = 130, gh = 150;
  ctx.fillStyle = '#10222b';
  rr(ctx, gx, gy, 54, gh, 8); ctx.fill();
  const front = state.board.front();
  if (front) {
    const loY = gy + gh - ((front.recipe.brothLo - 55) / 50) * gh;
    const hiY = gy + gh - ((front.recipe.brothHi - 55) / 50) * gh;
    ctx.fillStyle = 'rgba(63,158,77,0.75)';
    ctx.fillRect(gx + 4, hiY, 46, loY - hiY);
  }
  const temp = state.broth.pouring ? state.broth.temp
    : state.broth.pouredTemp != null ? state.broth.pouredTemp : 62;
  const ty = gy + gh - ((temp - 55) / 50) * gh;
  ctx.fillStyle = '#ff7a5c';
  ctx.fillRect(gx - 4, ty - 3, 62, 6);
  text(ctx, `${Math.round(temp)}C`, gx + 27, gy + gh + 16, 15, '#ffd98a', 'center', true);
  if (state.bowl.broth) {
    text(ctx, `in bowl: ${state.bowl.brothTemp}C ${state.bowl.broth}`,
      688, 344, 14, state.bowl.broth === 'bad' ? '#ff9a86' : '#a8e6a1', 'center', true);
  }
}

function drawPassAndButtons(ctx, state) {
  ctx.fillStyle = 'rgba(6,40,44,0.75)';
  rr(ctx, 890, 108, 374, 196, 10); ctx.fill();
  text(ctx, 'THE PASS — READY TO SERVE', 1077, 128, 17, '#ffd98a', 'center', true);
  if (state.passBowl) {
    drawBowl(ctx, state.passBowl.bowl, 1077, 218, 0.62);
    text(ctx, state.passBowl.name, 1077, 292, 15, '#e8f3e4', 'center', true);
  } else {
    text(ctx, 'no bowl waiting', 1077, 218, 15, '#8fb8ac', 'center');
  }
  const sz = ZONES[3], tz = ZONES[4];
  ctx.fillStyle = '#2e9e5b'; rr(ctx, sz.x, sz.y, sz.w, sz.h, 10); ctx.fill();
  text(ctx, 'SERVE  [Space]', sz.x + sz.w / 2, sz.y + sz.h / 2, 20, '#ffffff', 'center', true);
  ctx.fillStyle = '#7a4a3a'; rr(ctx, tz.x, tz.y, tz.w, tz.h, 10); ctx.fill();
  text(ctx, 'TRASH  [Bksp]', tz.x + tz.w / 2, tz.y + tz.h / 2, 20, '#ffe8dd', 'center', true);
}

function drawAssembly(ctx, state) {
  text(ctx, 'ASSEMBLY BOWL', 570, 356, 17, '#ffd98a', 'center', true);
  drawBowl(ctx, state.bowl, 570, 452, 1.0);
  // build checklist against the front ticket
  const front = state.board.front();
  let y = 560;
  ctx.fillStyle = 'rgba(6,40,44,0.75)';
  rr(ctx, 336, 540, 468, 84, 10); ctx.fill();
  if (front) {
    const r = front.recipe;
    const items = [
      ['noodles', state.bowl.noodles],
      ['beef: ' + r.beef, (r.beef === 'raw' && state.bowl.beefRaw) ||
        (r.beef === 'done' && state.bowl.beefDone) ||
        (r.beef === 'mixed' && state.bowl.beefRaw && state.bowl.beefDone) ||
        (r.beef === 'none' && !state.bowl.beefRaw && !state.bowl.beefDone)],
      ['herbs', r.herbs.every((h) => (state.bowl.herbs[h] || 0) >= r.herbs.filter((x) => x === h).length)],
      ['broth', !!state.bowl.broth],
    ];
    items.forEach(([label, ok], i) => {
      const x = 356 + (i % 2) * 230;
      const yy = y + 22 + Math.floor(i / 2) * 38;
      ctx.fillStyle = ok ? '#3f9e4d' : '#5d7a72';
      ctx.beginPath(); ctx.arc(x + 8, yy, 8, 0, Math.PI * 2); ctx.fill();
      text(ctx, label, x + 24, yy, 15, ok ? '#a8e6a1' : '#cfe0d8');
    });
  } else {
    text(ctx, 'no ticket — the bowl waits', 570, 582, 15, '#bfe3d8', 'center');
  }
}

function drawBins(ctx, state) {
  BIN_DEFS.forEach((b, i) => {
    const z = ZONES.find((zz) => zz.id === b.id);
    ctx.fillStyle = '#e9e2cd';
    rr(ctx, z.x, z.y, z.w, z.h, 10); ctx.fill();
    ctx.strokeStyle = '#9a8f6d'; ctx.lineWidth = 1.5;
    rr(ctx, z.x, z.y, z.w, z.h, 10); ctx.stroke();
    const cx = z.x + z.w / 2;
    if (b.herb) {
      const h = HERBS.find((x) => x.id === b.herb);
      ctx.fillStyle = h.color;
      ctx.beginPath(); ctx.ellipse(cx, z.y + 44, 30, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx - 18, z.y + 54, 20, 13, 0.5, 0, Math.PI * 2); ctx.fill();
      const have = state.bowl.herbs[b.herb] || 0;
      if (have) text(ctx, `x${have}`, cx + 38, z.y + 30, 16, '#263238', 'center', true);
    } else if (b.id === 'bin-noodle') {
      ctx.strokeStyle = '#d9cf9f'; ctx.lineWidth = 4;
      for (let k = 0; k < 4; k++) {
        ctx.beginPath(); ctx.ellipse(cx, z.y + 36 + k * 7, 32 - k * 3, 9, 0, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (b.id === 'bin-beefbasket') {
      ctx.fillStyle = '#a06a3a';
      for (let k = 0; k < 3; k++) {
        ctx.beginPath(); ctx.ellipse(cx - 20 + k * 20, z.y + 44, 13, 8, 0.3, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      ctx.fillStyle = '#e88ca0';
      for (let k = 0; k < 3; k++) {
        ctx.beginPath(); ctx.ellipse(cx - 20 + k * 20, z.y + 44, 13, 8, -0.3, 0, Math.PI * 2); ctx.fill();
      }
    }
    text(ctx, b.label, cx, z.y + 88, 14.5, '#263238', 'center', true);
    text(ctx, `[${b.key}]`, cx, z.y + 110, 12, '#7a7260', 'center');
  });
}

function drawBanner(ctx, state) {
  ctx.fillStyle = 'rgba(4,32,38,0.85)';
  rr(ctx, 330, 322, 620, 104, 16); ctx.fill();
  ctx.strokeStyle = '#e8a13a'; ctx.lineWidth = 3;
  rr(ctx, 330, 322, 620, 104, 16); ctx.stroke();
  text(ctx, 'PHO SAIGON MORNING', 640, 362, 40, '#ffd98a', 'center', true);
  text(ctx, 'dawn noodle broth — dip, pick, pour at the perfect heat',
    640, 402, 17, '#cfe8dc', 'center');
}

export function drawScene(ctx, state) {
  drawBackground(ctx, state);
  drawHud(ctx, state);
  drawBoard(ctx, state);
  drawStations(ctx, state);
  drawPassAndButtons(ctx, state);
  drawAssembly(ctx, state);
  drawBins(ctx, state);
  if (state.flash) {
    ctx.fillStyle = 'rgba(4,32,38,0.85)';
    const w = Math.max(280, state.flash.length * 11 + 40);
    rr(ctx, 640 - w / 2, 600, w, 40, 10); ctx.fill();
    text(ctx, state.flash, 640, 620, 17, '#ffd98a', 'center', true);
  }
  if (state.shot === 'cover') drawBanner(ctx, state);
  if (state.mode === 'over') {
    ctx.fillStyle = 'rgba(2,18,22,0.78)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'SHIFT OVER', 640, 330, 54, '#ffd98a', 'center', true);
    text(ctx, `You earned ${state.coins} coins this morning.`,
      640, 396, 24, '#e8f3e4', 'center');
    const rz = ZONES[5 + BIN_DEFS.length] || ZONES.find((z) => z.id === 'restart');
    ctx.fillStyle = '#2e9e5b';
    rr(ctx, rz.x, rz.y, rz.w, rz.h, 12); ctx.fill();
    text(ctx, 'NEW SHIFT [Enter]', rz.x + rz.w / 2, rz.y + rz.h / 2, 24, '#ffffff', 'center', true);
  }
}
