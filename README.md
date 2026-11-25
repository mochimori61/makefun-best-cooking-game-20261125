# Pho Saigon Morning — Dawn Noodle Broth

[![make.fun bounty](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
![rank](https://make.fun/badge/best-cooking-game-20261125-0137/mochimori61/makefun-best-cooking-game-20261125/rank.svg)
![reward](https://make.fun/badge/best-cooking-game-20261125-0137/mochimori61/makefun-best-cooking-game-20261125/reward.svg)

Bounty: https://make.fun/bounty/best-cooking-game-20261125-0137

A dawn pho stall game. The morning rush starts at sunrise: tickets pile
up on the order board, each asking for a specific bowl — rare beef that
the broth itself must cook, well-done beef blanched first, or a mix of
both — with its own herb set and its own broth temperature band.

## How to play

1. Read the front ticket on the order board (left).
2. Dip the noodles: click **Noodle Dip** [1], wait for the basket's timer
   ring to fill, then click the basket to lift the noodles into the bowl.
   Beef that must be well-done goes through the same pot with **Beef Dip**
   [2]; rare beef slices are laid raw with **Raw Beef** [3].
3. Pick the herbs the ticket asks for — Thai basil, cilantro, bean
   sprouts, lime, chili, onion [4–9]. Extra or missing herbs fail the bowl.
4. Pour the broth: click the **Broth Pot** to start the pour and click
   again to stop the temperature needle inside the ticket's green band.
   A perfect pour earns a bonus; a cold or scalding pour gets sent back.
5. **Serve** [Space] before the patience bar runs out. Late tickets and
   rejected bowls are strikes — three strikes end the shift. The shift
   lasts 180 seconds and the rush keeps getting faster.

## Layout

- `game/index.html` — page and canvas
- `game/src/recipes.js` — the pho menu: beef style, herbs, broth band, price
- `game/src/orders.js` — order board, ticket spawning, patience
- `game/src/stations.js` — blanch baskets, broth temperature pour, bowl judging
- `game/src/render.js` — all canvas drawing (stall, pots, bowls, bins)
- `game/src/input.js` — mouse and keyboard controls
- `game/src/main.js` — the shift loop and screenshot scenes
- `main.ts` — builds the submission dossier
