# Operations Briefings kit — style frames and scene pieces

Art direction for the eleven Operations Briefings, drawn to the **BertieV4** design system (the game's only design system — see DESIGN.md, section "Operations Briefings illustration"). Redraw the briefing kit from these files; every scene should then match the two style frames.

## What's here

- `frames/frame-what-a-fare-does.svg`, `frames/frame-cash-tank-profit.svg` — the two 1600 × 900 style frames; `frames/frame-can-you-afford-to-run-it.svg` — Briefing 13, beat 3. Match their lighting, depth and colour use in every scene.
- `pieces/*.svg` — 37 scene pieces, each on a transparent background, built only from flat SVG shapes (paths, rects, circles, ellipses), linear/radial gradients and opacity. No filters, masks, images or embedded fonts.
- Text inside pieces (signs, boards, price, card) is ordinary `<text>` in the BertieV4 `sans` stack with tabular figures. Treat it as live text the scene sets.

## The look, in rules

1. **Ground:** deep navy night environment on `bg-0` / `bg-1` (#020812 / #041426), darker towards the top of the sky. Boards and panels on `panel-1` #081f3d, active parts on `panel-active` #123e64, reference on `panel-0` #05152b.
2. **Light from the upper left.** Object gradients run light top-left → darker bottom-right; a thin pale top edge marks lit top surfaces; a soft cyan pool (10–13 %) sits on the floor near the light.
3. **Depth (2.5D):** boxes show a lit top face and a darker right face; cylinders a lit top ellipse; every grounded object has a separate soft shadow ellipse (black, radial, 35–55 %) offset slightly right, so a plane can lift away from it.
4. **Semi-realistic, simplified:** real proportions, no outlines around shapes, no faces, nothing decorative.
5. **Square corners** (`radius-none`) on panels, boards, cards, tags and strips. Flight strips are the timetable's blue blocks, never paper.

## Colour roles (BertieV4 tokens)

| Token | Value | Used for in this kit |
|---|---|---|
| `cyan` | #36c6ff | What is current or interactive: the fare slider, the now-line, the current month, eyebrows, and the fuel filling the tank |
| `gold` | #f2c14e | Money and value: coins, ticket money, cash and the tank's £ value. Light (glow, bright edge) still goes on one thing per scene |
| `green` | #3ce394 | A good outcome: 19/19 full flight, a full flight's strip edge |
| `amber` | #ffb547 | A half-full flight's strip edge |
| `red` | #ff5f5f | Only something genuinely wrong (a disruption card's edge). Passengers who miss out are dimmed to 45 %, never red |
| `red-kite` / `red-kite-ember` / `red-kite-ivory` | #7a1428 / #a8223a / #f1e9dc | Red Kite Air only: oxblood tail, sweep, engines, badge and name; ember for light and the pinstripe; ivory for the kite and name. Kept off the pupil's livery menu. On navy screens Red Kite shows as its badge, never red text |
| `people-neutral` / `people-head` / `people-family` | #9fb3cf / #c4d4ea / #c8956a | Passenger clothing (neutral by default), every head, family groups; business travellers wear `cyan`, only in scenes about the mix |
| `text` / `text-soft` | #eaf2ff / #9fbde3 | Figures and labels |
| `magenta` | #ff4fd8 | Not used in these pieces; it stays reserved for the unknown "?" in a sum |

## Red Kite Air

Red Kite has a full identity (lockup, badge, ATR 72 and E175 liveries, gate sign, price tag): see the `red-kite-*` pieces and DESIGN.md, section "Red Kite Air, the rival". The kite always flies up and to the left, tilted 10°.

## Scale and parts

- Aircraft are drawn at **12 px = 1 m**, facing left, wheels on the bottom edge of the viewBox, so they share one ground line and keep true relative size. Scale them all by the same factor in a scene.
- `data-part` names the shapes a scene changes: `body` and `tail` (pupil's livery; `tail` is blank white until painted), `kite-mark`, `door`, `sign`, `fuel`, `slot`, `wheel`, `price`, `icon`.

## Pieces and how they animate

| File | Size | Parts | Animates |
|---|---|---|---|
| `aircraft-twin-otter.svg` | 190×70 | `body`, `tail` | slides along the ground; the propeller disc flickers; on take-off it pivots nose-up about the main wheel. |
| `aircraft-saab-340.svg` | 236×84 | `body`, `tail` | as the Twin Otter; the gear can fold away after take-off (hide the gear group). |
| `aircraft-atr-72.svg` | 326×92 | `body`, `tail` | as the Twin Otter; doors open by fading the door outline to a dark fill when boarding. |
| `aircraft-e175.svg` | 380×118 | `body`, `tail` | jets have no propeller disc; a faint heat shimmer behind the engine (one translucent shape, opacity only) while taxiing. |
| `aircraft-red-kite-atr-72.svg` | 326×92 | `body`, `kite-mark`, `tail` | taxies in from the right edge to the next gate and stops. Oxblood livery that no pupil can choose; the kite never animates. Full identity on the Red Kite board. |
| `aircraft-787.svg` | 754×204 | `body`, `tail` | mostly seen far off or as the big goal; it slides and scales as one piece. At this scale a Twin Otter fits under its tail. |
| `terminal-front.svg` | 600×260 | `door`, `sign` | stays still (it is the stage). The door brightens when boarding opens; the sign takes the gate and destination as text. |
| `gate.svg` | 300×240 | `door`, `sign` | the doorway lights up when boarding starts and dims when the gate closes. |
| `day-column.svg` | 170×520 | — | seven sit side by side. Flight strips drop in one by one; the day's total counts up as each lands; a finished day dims to the step-back surface. |
| `route-strip.svg` | 700×120 | — | the cyan now-line slides along the hours; flight blocks slide in from the left; nothing else moves. |
| `calendar-board.svg` | 320×250 | — | the cyan outline steps month to month; past months drop back to the dim surface; a small marker shows a month with an event. |
| `passengers-neutral.svg` | 170×70 | — | walk by sliding along with a slight two-frame leg swap; they stop in place, never bounce. |
| `passengers-business.svg` | 180×70 | — | as neutral, a touch quicker; the case moves with the figure. Use cyan only in scenes about the passenger mix. |
| `passengers-family.svg` | 150×70 | — | move as one group, children kept beside adults; a family is never split across a flight. |
| `passengers-seated.svg` | 200×56 | — | an empty seat (seat alone) becomes a seated figure as each passenger arrives, one after another; 19 in a row is a full Twin Otter. |
| `passengers-no-seat.svg` | 170×70 | — | figures that miss out dim in place over half a second and stay visible, with a small grey count. Never red: they are an opportunity, not a failure. |
| `fuel-tank-low.svg` | 180×262 | `fuel` | the fuel rectangle (data-part="fuel") rises or falls with its bright top line; the glow behind grows with the level. Litres and pounds sit underneath as live text. |
| `fuel-tank-half.svg` | 180×262 | `fuel` | the fuel rectangle (data-part="fuel") rises or falls with its bright top line; the glow behind grows with the level. Litres and pounds sit underneath as live text. |
| `fuel-tank-full.svg` | 180×262 | `fuel` | the fuel rectangle (data-part="fuel") rises or falls with its bright top line; the glow behind grows with the level. Litres and pounds sit underneath as live text. |
| `cash-vault.svg` | 240×250 | `slot`, `wheel` | stays put; the wheel turns a quarter when money leaves or arrives; coins leave through the top slot. Balance below as live text. |
| `coin-stream.svg` | 340×190 | — | coins travel the dotted arc one after another (about 0.6 s each), tilting as they go; the stream stops the moment the amount is paid. |
| `price-tag.svg` | 200×104 | `price` | the figure rolls to the new price (old number slides up, new one in). Red Kite's tag carries its badge, never a red fill. |
| `price-tag-red-kite.svg` | 200×104 | `price` | the figure rolls to the new price (old number slides up, new one in). Red Kite's tag carries its badge, never a red fill. |
| `money-stack.svg` | 160×104 | — | bundles drop onto the stack one at a time as passengers sit; its label (for example 38 × £80) appears once the stack is complete. |
| `event-card.svg` | 330×150 | `icon` | slides up into place once, then settles; the effect figure changes after a pause. A real disruption gets a red edge; anything else stays navy. |
| `aircraft-red-kite-e175.svg` | 380×118 | `body`, `kite-mark`, `tail` | as the Red Kite ATR 72; appears once Red Kite grows. Oxblood livery, kite never animates. |
| `red-kite-gate-sign.svg` | 260×70 | — | stays still; the badge never animates; destination and time are live text. |
| `red-kite-lockup.svg` | 360×88 | `badge` | used in news and briefing titles; appears with a short fade, never animated. |
| `red-kite-badge.svg` | 40×40 | — | Red Kite's mark on any navy screen (beside its fare, map pins, news); appears with its context, never animated. |
| `cash-gauge.svg` | 400×560 | `cash-level`, `reserve-line` | the gold level rises as coins drop in and falls when fuel is bought (t-fuel); the red reserve line drags up and down by its handle; the part above the line brightens to show what can be spent. |
| `fuel-drum-needed.svg` | 70×90 | — | a dashed outline; fills from the bottom when bought (0.6 s), Monday first. |
| `fuel-drum-bought.svg` | 70×90 | — | glows softly while waiting; drains top to bottom when its day is flown. |
| `fuel-drum-flown.svg` | 70×90 | — | appears as the day completes; the tick lights once. |
| `fuel-drum-emergency.svg` | 70×90 | — | drops in grey when a day runs dry; never red (dearer, not a disaster). |
| `day-stand.svg` | 96×40 | — | seven in a row; today's stand gets a cyan edge; flown days dim their label. |
| `aircraft-grounded.svg` | 190×70 | — | fades to 35% when it cannot fly; its day cost still appears on the board. |
| `rules-card.svg` | 360×200 | — | slides up once at the end of the briefing; then sits still on Home under Coming up until January. |

## Motion rules for all scenes

- Motion only for the change the scene is explaining: slide, fill, count up, dim, light once. No bounce, no loops, no idle wobble (propeller flicker and engine shimmer only while the aircraft moves). Use the BertieV4 durations (`t-data` 350 ms, `t-result` 450 ms, `t-fuel` 600 ms).
- Consequences appear one after another, about 0.4 s apart. A coin takes about 0.6 s along the arc.
- With reduced motion on, jump to each end state; colour and labels still show what changed.

## Anything that can't be flat shapes?

Nothing in this set. Effects usually done with blur are flat shapes here: the propeller disc is a translucent ellipse; the fuel glow and floor light pool are radial gradients. If a later scene needs motion blur, use a few translucent copies of the shape instead of a filter.
