// recipes.js — Pho Saigon Morning menu data.
// Every bowl is built the same way: blanch the rice noodles, lay the beef
// (raw slices that the broth will cook, or beef blanched well-done first),
// pick the fresh herbs the ticket asks for, then pour broth at the right
// temperature. Prices are in coins; patience is in seconds.

export const HERBS = [
  { id: 'basil',   name: 'Thai Basil',  color: '#2e9e5b' },
  { id: 'cilantro',name: 'Cilantro',    color: '#57b24a' },
  { id: 'sprouts', name: 'Bean Sprouts',color: '#e8e4c8' },
  { id: 'lime',    name: 'Lime Wedge',  color: '#a8d94e' },
  { id: 'chili',   name: 'Red Chili',   color: '#d93b2b' },
  { id: 'onion',   name: 'Onion',       color: '#f2ead8' },
];

export const RECIPES = [
  {
    id: 'tai', name: 'Pho Tai', sub: 'rare beef, broth-cooked',
    beef: 'raw', herbs: ['basil', 'sprouts', 'onion'],
    brothLo: 86, brothHi: 92, price: 14, patience: 75,
  },
  {
    id: 'chin', name: 'Pho Chin', sub: 'well-done blanched beef',
    beef: 'done', herbs: ['cilantro', 'onion', 'lime'],
    brothLo: 82, brothHi: 88, price: 15, patience: 80,
  },
  {
    id: 'taichin', name: 'Pho Tai Chin', sub: 'rare + well-done beef',
    beef: 'mixed', herbs: ['basil', 'cilantro', 'sprouts'],
    brothLo: 84, brothHi: 90, price: 18, patience: 90,
  },
  {
    id: 'cay', name: 'Pho Cay', sub: 'rare beef, extra chili heat',
    beef: 'raw', herbs: ['basil', 'chili', 'chili', 'onion'],
    brothLo: 88, brothHi: 94, price: 17, patience: 85,
  },
  {
    id: 'chay', name: 'Pho Chay', sub: 'garden herbs, no beef',
    beef: 'none', herbs: ['basil', 'cilantro', 'sprouts', 'lime'],
    brothLo: 80, brothHi: 86, price: 13, patience: 70,
  },
];

export function herbName(id) {
  const h = HERBS.find((x) => x.id === id);
  return h ? h.name : id;
}

// Count how many of each herb a list asks for (chili can appear twice).
export function herbCounts(list) {
  const out = {};
  for (const id of list) out[id] = (out[id] || 0) + 1;
  return out;
}
