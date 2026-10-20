# Bertie's briefings review in the game (20 October 2026)

The handover had three parts:
- the DESIGN.md of 20 October, which is now installed;
- the "Operations Briefings — scene by scene" doc;
- the BertieV4 design system.

DESIGN.md's decisions log for 20 October settles five rules. They are built here, in year one only (CLAUDE.md).

The doc's ten "Decisions for you" were not ticked yet, and DESIGN.md says the scene-by-scene decisions follow once Bertie has checked it. So the new briefings and the rebuilt scenes wait for that.

Screenshots of the briefings as they look in the game are in `docs/screenshots/o20/`, at 1366 × 768 and a few at 1920 × 1080.

## What changed

### 1. The words sit inside the picture
- **Every year-one briefing** shows its words on a soft dark plate in the scene, centred near what they describe. The words are 20–22px, one or two short sentences.
  - The art is drawn a little smaller from its foot, so it moves down to make room.
  - The bottom bar holds only Pause & discuss, Back and Next.
- **Where the words sit:**
  - **Cash, tank, profit:** just under the £1.30 price board, as Bertie asked. The vault, tank, week and plane moved down to make room.
  - **Renting a plane:** over the sky on the left, clear of the price and the rent stack.
  - **Can you afford to run it?:** in the week's column, above the plane.
  - **What a fare does:** next to each beat's picture.
  - **The rest:** at the top of the scene, where they cover nothing.
- **Chapter 3's Profit is not cash** keeps its old frame (year one only).

### 2. Predictions are back
- **How they work:** a question in the words, two or three chips, and Not sure, which always counts.
  - Next appears once he has tapped one, and he can change his mind until he presses it.
  - Nothing is marked: no ticks, crosses, red or "Correct!". His chip is simply outlined in cyan.
  - The scene after shows what happens, with "You predicted: …" small in the words.
- **The three predictions the 19 October "no guesses" rule took out are back:**

| Briefing | The question | The chips |
| --- | --- | --- |
| What a fare does, beat 5 | Which makes more ticket money? | The £100 plane · The £110 plane · Not sure |
| Customers have a choice | Red Kite is £60 cheaper. What will some of your passengers do? | Stay with us · Move to Red Kite · Not sure |
| Weekdays and weekends | Which days look different from the rest? | Mon to Fri · Sat and Sun · Not sure |

- **The other new predictions in the doc** come with its scene-by-scene plan: Cash, tank, profit's "Before you buy", Two planes, How long will it take?, One big Saturday and A year of demand.

### 3. Money is never a liquid
- **Can you afford to run it?** now draws its cash as gold coins stacked in an open steel vault. Before, the cash was a tall glass of gold, which looked like fuel.
  - The scale stays up the side and the balance is under it.
  - The "keep £…" line crosses the stack, and the coins above it carry a "£… to spend" tag.
- **Only fuel is drawn as a liquid.** No other briefing drew money as a liquid (Cash, tank, profit already used a vault).

### 4. Two briefings removed
- **More demand than seats** (`full_route`) is retired.
  - Its workbook row is `removed` (the workbook's word for "kept for its id, not loaded").
  - Its page is in `src/opening/briefings/retired/`, out of the game.
  - The week-1 review opens no briefing now. The game has 11 briefings.
- **Snacks on board** (`cabin_sales`) is `removed` too. It never had a page.

### 5. No snacks in year one
- **"Snacks on board are dropped from the game, so the Launch Day sheet has no Cabin sales rows."** From Launch Day to the year-1 accounts:
  - **No snack choice.** The Studio's On board choice and the Operations Model's On board line are gone.
  - **No snack money.** There are no sales, stock or free-snack costs, and no star for free snacks.
  - **No Cabin sales rows.** The Launch Day sheet has rows 1–9: tickets at the three fares, the other route, and the profit. Its sums are Sums 1–5, and everything after numbers on from 6. The Monday sheets have no Cabin sales row either.
  - **Old saves.** A save from before that sold snacks flies on without them.
  - **No £0 lines.** On-board sales lines that could only read £0 are left off: the Studio's Money, the model's results and a service's costs card.
  - **Daily colours.** The hen party and the birthday cake only touch snack sales, so they give way to another colour that day. Year one now has none of them.
- **Workbook changes:**
  - Settings `snacksInYearOne` = off. This is the switch: set it to on and snacks come back as before.
  - Calendar day 1's headline now reads "timetable, fare, fuel", and the chapter 1 card no longer says "snacks".
  - The snack supplier curveball (24 Sep, both tracks) and its options are `removed`.
  - The mystery shopper's first choice now reads "Seats, service, signs".
  - The SheetSums Cabin sales row has a note.
  - The README sheet has a line for all of it.
- **Chapters 3 and 4 keep snacks until Bertie says "extend".** A pupil there meets them as something new in September 2031. On "extend" they go from the whole game.

## Questions for Bertie

1. **Launch Day has no sum built by clicking cells now.**
   - Cabin sales was the only Build on Launch Day; the ticket sums and the profit are typed from the book. So a pupil's first Build is now the Sunday review's week total.
   - If you want one on Launch Day, the first ticket sum could be the Build: one cell in the workbook's SheetSums (`launch.tickets`, how = build) and a small code change so only the first column is built.
2. **A curveball for 24 September?** The snack supplier was one of D104's six. Fable may want something in its place.
3. **Captain's challenge 2, "Win the catering contract"** (21 Apr 2031) stays. It is a division story (648 sandwiches across 6 flights), not snack sales. Say if it should go too.

## The doc's "To check" items, from the workbook

- **Two planes, one route:** the Saab 340 burns **230 litres** to Dublin and the Twin Otter **180 litres**, from the workbook's aircraft figures and the game's fuel model. The built briefing's 230 is right; ChatGPT's 225 and the old 224 aren't.
- **Renting a plane:** the 787 is **£12,000,000** to buy and **£6,000 a day** to rent. That is 2,000 days, about 5½ years, as the doc says.
  - The doc asks whether the briefing should use a different plane so his own rent-or-buy sum isn't a copy. That's a design choice for Bertie.
  - A pupil on the test save reaches 6 January with about £858,000. The built briefing shows £1.5m.
- **Can I afford the plane?:** the doc's figures (£12,409, Sunday cash £14,859 or £8,465) are the built briefing's example. When it moves to the first plane purchase it will use the pupil's own week, as it does now on the Fuel desk.

## Waiting for the doc's ticks

Once Bertie has ticked or changed them, the briefings can be rebuilt scene by scene:
- the new opening briefing, How an airline makes money, with the aim card;
- spacing the briefings out;
- Cash, tank, profit's longer middle;
- moving Can you afford to run it? to the first plane purchase;
- Time of day matters;
- A forecast isn't a promise;
- the planner settings in One big Saturday and A year of demand;
- the formula triangle as a reference card.

## Tests

The regression is running; its results go here.

## Balance

Chapter 1's figures without snacks go here once the run ends.
