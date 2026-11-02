# Chapter one check-up: the figures, accessibility, and what to improve (2 Nov 2026)

You asked for three things:
- six test pupils played through chapter one with different choices, to see how the figures come out;
- an accessibility check;
- a walk through every screen, looking for things to improve.

I changed nothing in the game for this. It's a report, and the decisions are yours. Usually this phase leaves the figures alone, but you asked, so section 1 looks at them. They're all still placeholders, so read it as "how the game reacts", not "are the numbers right".

The screenshots this report mentions are in `docs/screenshots/review-2-nov/`.


## 1. How different choices play out

**How I tested it.** Six pupils each start from the same save: the end of week 1 (Sunday 8 September), with one Twin Otter and £21,135 in the bank. The test toolkit plays each of them through to the chapter review on 28 December, answering every sum correctly. The only thing that differs is the choices each pupil makes on a Monday. Every figure in the game is still a placeholder, so this shows how the game reacts to choices, not whether the numbers are final.

| Pupil | What he does | Cash at the chapter review | Weeks more than 10% below the best plan | The Board's note | Routes Red Kite took | Stars at the end |
| --- | --- | --- | --- | --- | --- | --- |
| **The planner** | Buys a second Twin Otter on 23 Sep and picks the best plan every Monday | **£560,599** | none | never | 6 | 4½ |
| **Monthly** | Second plane on 23 Sep, re-plans on the first Monday of each month | £480,839 | weeks 7, 8, 9, 11 | 4 Nov | 8 | 3½ |
| **Expands once** | Second plane on 23 Sep with a good plan, then never changes it | £471,217 | weeks 7, 8, 9, 11 | not measured* | 8 | 4 |
| **The keeper** | Keeps his Launch Day plan (Dublin ×2, Paris ×2 at £90 and £100) | £300,763 | weeks 7–9 and 11–13 | 4 Nov and 2 Dec | 9 | 4½ |
| **Top fares** | Same plan, both fares at £110 | £243,533 | weeks 2–9 | 30 Sep and 28 Oct | 9 | 4½ |
| **Lowest fares** | Same plan, both fares at £70 | £196,678 | weeks 2–9 and 11–14 | 30 Sep, 28 Oct, 2 Dec | 9 | 4½ |

*This was the first run, before I added the check that catches the Board's note. Its weeks 7–9 look just like the monthly pupil's, so it almost certainly got the note on 4 November too.

**Re-planning pays, but the gap opens late.** For the first three weeks the Launch Day plan already is the best plan for one plane, so every pupil is within 0–3% of it. The amber gap on Graph 1 barely shows in weeks 2–3 unless he changes his fares. It opens in week 4, when the new routes and the second plane arrive, and widens in October. By the end, the keeper has a little over half of what the planner has (£301,000 against £561,000). Buying the second plane is the biggest single step: it lifts weekly profit from about £17,000 to about £28,000.

**Fares swing it hard.** Moving both fares to the top (£110) halves weekly profit, from about £18,000 to about £8,000. The lowest fares (£70) cut it to £4,000–5,000, and in week 7 that pupil made a loss of £1,028. That's a strong lesson about fares, maybe stronger than you want, and it's one for Fable to look at.

**Week 7 is a jolt.** On Monday 14 October the fuel price jumps from £1.97 to £2.94 a litre. Passengers stay the same, but every flight costs more, so the keeper's week drops from £16,400 to £12,200. That's why his gap jumps to 38% that week. The planner moves away from Dublin and hardly feels it. It's a good moment for the graphs to show.

**An older rule from October is still at work.** At the November monthly check, "the board" can ask for "a plan that tests a different fare or route", and the plan screen waits until he changes something. This is the monthly "board review" from the earlier sign-off rules, not this round's gentle note. It's what changed the plan of all five pupils who weren't picking the best plan every week: on 11 November the toolkit had to choose a change for them, where a real pupil would choose his own. So there are now two "Boards": the old one blocks the plan, the new one has a word. You said the Board shouldn't step in harshly, so you may want to keep only one.

**Red Kite takes routes even from the planner.** With two small planes nobody can fly every route, so even the best plan leaves some out. Three weeks later Red Kite takes them: six routes from the planner, nine from the keeper. For the keeper it costs nothing he can see, because he never flew them. So at the moment the rival works more as a signal than a penalty. One option is to count a route as ignored only when his planes had time to fly it, as the stars rule now does.

**Monday can pile up.** On 4 November the keeper clicks through four news cards in a row: Red Kite three times (Brussels, Berlin, Milan), then the Board. One Red Kite card listing every route taken that Monday would be calmer.

**The graph question becomes a regular.** It only comes when the gap is over 10%, but for a pupil who never changes anything that's most weeks. The keeper got it 6 times and the lowest-fares pupil 12 times (nearly every week), and each time it takes one of Finance's two slots at that pause. You might cap it, for example the first two times in a row of bad weeks, or at most every other week.

**Stars hardly react.** Everyone ends on 3½ to 4½ stars, and the keeper's 4½ equals the planner's. With the careful turned-away rule, stars don't separate good play from lazy play in chapter one. That may be what you want; I'm only pointing it out.


## 2. Accessibility

**How it was checked.** I scanned 36 screens with axe, a standard accessibility checker, and measured text contrast from the pixels on screen. The keyboard checks used real key presses. One thing worth knowing first: DESIGN.md says the pupils are in Years 5–6 (about 9 to 11), so small text and fiddly controls matter even more.

**The big picture.** The game does a lot right. The page has a language and title. Icon buttons have names. Answer boxes are labelled ("Dublin ticket revenue at £100, Sum 1"). Wrong-answer hints are read out and use his own numbers. Reduced motion is respected, nothing moves on by itself, and there are no time limits on sums. The new graphs don't rely on colour alone either: they have a legend, solid against outlined bars, stripes, and the words "not in your plan".

The problems are mostly in three places: the keyboard, small or faint text, and screen readers.

| How serious | What's wrong | Where | A fix that fits the design |
| --- | --- | --- | --- |
| **Blocks him** | Σ SUM can't be done with the keyboard. Enter on a day cell only says "drag down the column first", so a keyboard user can't finish the Sunday review from week 3. Clicking Monday then Sunday works with a mouse, but the screen only ever says "drag". | Sunday review, weeks 3 onwards (screenshot 01) | Enter on the first cell, then Enter on the last cell does the same as dragging. Say so in the instruction. |
| Serious | After almost every action the keyboard focus jumps back to the top of the page, so it takes 18–23 Tab presses to reach the next cell. | Every sheet | After each change, put focus on the next thing to do. |
| Serious | Briefings don't take the keyboard focus, and Tab wanders out to buttons hidden behind them. | Briefings | Focus Next when a briefing opens, and keep Tab inside it. |
| Serious | The blue main buttons (Watch ▶, Got it, Plan the week ▶ and others) are just under the contrast minimum (4.0:1 against 4.5:1 needed). Their labels are only 12–15 px on screen. | Everywhere (screenshot 02) | A darker blue or a bigger, bolder label. *Needs a DESIGN.md change.* |
| Serious | "SEND TO OPERATIONS WALL" is white on green at 2.6:1, and it's in capitals. DESIGN.md already says dark text on green buttons. | Ready page (screenshot 03) | Follow DESIGN.md: dark text, sentence case. |
| Serious | The sheet's column letters and row numbers (A–F, 1–11) are tiny (about 9 px) and faint (2.1–2.8:1). But they're the cell names the formulas and hints use ("= C2 × C3"). | Every sheet | Brighter colour, at least 12 px. |
| Serious | Zooming the browser does nothing, because the game rescales to fit the window. At 1366 × 768 some text is 7–10 px on screen: map buttons, FULL chips, eyebrows, keyboard hints. | Everywhere (screenshot 04) | A teacher "Bigger text" switch. *Needs a DESIGN.md change to the type sizes.* |
| Serious | Adding a flight only works by dragging; clicking "+ Dublin" just says "Drag it onto a plane". Pressing Enter on it does work, but nothing tells him. | Timetable | A click adds the flight, the same as Enter. |
| Serious | To a screen reader, the sheet is an empty grid, and three cells are all read as "Passengers: 38". | Every sheet | Give each cell its name, e.g. "C2, Dublin at £90, Passengers 38". |
| Serious | Graph 1 gives screen readers only its title, not the figures the counted question needs. | Your week in pictures | Put the latest week's two figures and the gap in its description. |
| Moderate | A right answer is shown only by colour, and the graph question's result isn't read out. | Sheets, graph question | Read out "Right: £17,981". |
| Moderate | Focus rings are hard to see (about 1 px). The Fuel desk's links only change colour. | Everywhere (screenshot 05) | A 2 px cyan focus ring for every control. *DESIGN.md has no focus style yet.* |
| Moderate | Some text is faint: yesterday's plan in the two-plans timetable (3.0–3.3:1), muted small text (4.0–4.4:1), locked menu items (1.6–2.4:1). | Several | Lift these to 4.5:1. Yesterday's plan matters, because he compares against it. |
| Moderate | Some click targets are small: route chips, HQ "Edit" links (27 × 12 px), "What's in this?", and the graph question's answer box. | Several | At least 24 × 24 px. |
| Moderate | Finance's demonstrations lock the keyboard for about 6 seconds, with no way to stop them. | Demos | Let Escape skip to the end. |
| Minor | Headings skip levels on 13 screens. Some lines run to 154 characters. There are capitals beyond the eyebrows (event choice titles, departures boards). Two buttons are both called "Choose ▶". Stars are read as five "★" without saying how many. | Several | Small tidy-ups. |


## 3. Ways to improve it

The walkthrough played a new airline by hand from naming it through week 5. After that it mostly kept the same plan, with the toolkit playing some stretches through to the end card. Here are the five changes that would help pupils most, then the rest.

**1. Let the maths lead straight to a decision.** In week 3 Finance asks "Paris: £90 or £100?" He works out that £100 earns £190 more a flight, and the screen says "Set it in the Studio if you want it". But there's no button to do that, and Carry on goes to the Fuel desk (screenshot 06). The tester's Paris fare stayed at £90 for the rest of the chapter. The Board's card and Your week in pictures have the same problem: they show the gap but don't take him anywhere he can act on it. Week 4's "Is the change worth it? ✓ Yes, +£473 a day" already does this well. Suggestion: "Try £100 in my plan ▶" under the answer, opening the two plans with the change made, so he still compares and chooses; and an **Edit plan ▶** on the Board's card and the pictures page. *Mostly Claude Code; a small Claude Design pass for where the buttons go.*

**2. Make new routes easy to add, and stop Back losing his work.** The Add a flight tray only ever shows Dublin and Paris. A new route means "+ Add a route" and a separate page, and pressing ◀ Back there lands on the opener marked UNCHANGED, with the new plan he'd dragged together gone (screenshot 07). The tester had to rebuild a plan three times. Meanwhile Graph 2 showed Frankfurt as the best earner "not in your plan" for two weeks, before Red Kite took it with no warning on the plan screen. Suggestion: new routes appear in the tray with a NEW tag and a quiet countdown ("Red Kite in 2 weeks"), and Back keeps his new plan. *Needs Claude Design.*

**3. Weeks 6–13 show the same week three times.** From week 6 he sees the week's result on the Operations Wall ("WEEK COMPLETE"), again on HQ ("Week 7 Results", Close the week), and again on Monday ("How did week 6 go?"). That Monday review uses the old card style ("Week 6 total £9,260 ? [ ] = ? Check ✓"), not the sheet he's used for five weeks (screenshot 08). Keeping the plan takes about 10 clicks a week. Suggestion: the Wall's button goes straight into a review on the same sheet as weeks 1–5, and the HQ results step goes. *Large; Claude Design and Code.*

**4. Fix the words that mislead.** This is mostly quick:
- **The what-if sheet contradicts itself at the top fare.** With Dublin at £110, the top fare, the what-if column has to go down to £107, yet the callout still says "£3 more a ticket = £1,596 more a month" (screenshot 09).
- **Task lines built from a sum's name read badly**, for example "Calculate the what is the difference between the best and the worst day" and "Calculate the £90 or £100". This is my round-3 rule.
- **Buttons that say the wrong thing:**
  - "Plan the week ▶" on a Red Kite card when the next thing is another Red Kite card;
  - "Fly tomorrow ▶" in week 4;
  - "Plan week 15 ▶" on 28 December, where it actually goes to the chapter accounts (that one's mine, on the pictures page).
- **Out-of-date words:**
  - the Launch Day intro still mentions snacks;
  - December says "from now on you decide when to buy fuel", though he's used the Fuel desk since week 3;
  - the end says "reputation revealed", though stars went public in week 4.

**5. Explain the graphs the first time, and help when the graph question goes wrong.** The first Your week in pictures can ask a counted question straight away, with nothing explaining the gold bar, the outline or the stripes (screenshot 10). Two wrong answers end with "The answer: £10,288." and no method; there's no hint, unlike every other sum. With only two routes, Read the graph is a coin toss. Suggestions:
- a two-step walk-through on the first visit;
- a hint in his own numbers ("best £17,981 − yours £7,693");
- no Read the graph question when fewer than three routes are shown.

**Other things worth knowing**

- **Flow.**
  - Week 1 gives five Day pages in a row that look almost the same. Day-by-day week 1 is deliberate, so this is your call.
  - "A week flying" looks different five ways across the chapter: Day pages, Week N is flying, the week-5 board with Step, the Operations Wall, and December's HQ panel.
  - Week 4's Monday stacks up: stars page, news, four new routes, the weekends callout, a tip, What if, the plane shop (screenshot 14).
- **Words.**
  - The main button keeps changing its name: Keep plan, Run anyway, Keep for tomorrow, Fly week N, Send the week to operations, Plan the week, Carry on, Continue.
  - "How did Week 6 go?" and "How did week 6 go?" appear one after the other.
  - The start cash shows £2,500, but the chapter accounts say "£5,000 → …".
  - Week 4 says +£473 a day on one screen and +£554 on the next for the same change.
- **Maths and feedback.**
  - The Launch Day sheet's feedback is excellent and worth copying elsewhere ("A carry was missed: the carry 1 into the hundreds wasn't added.").
  - If he picks the top fare on Launch Day, every column says FULL 19, so "a fuller plane doesn't always earn more" can't show.
  - Some later questions come out trivial (19 × £10; best day − worst day = £60).
- **Looks.**
  - On the pictures page, Graph 1's week labels and new-route names overlap once there are 14 weeks (screenshot 11). That's mine.
  - Week 4's "Is the change worth it?" prints a column head over itself, and its first callout covers a line (screenshot 12).
  - "Ready for week 6" puts a day's revenue and costs beside a week's profit.
- **Motivation.**
  - The end card is flat: timetable, fleet, passengers, cash and Play again (screenshot 13). There's no tally of sums, best week, stars or certificate, though the game opens with a certificate. A logbook-style ending would be worth drawing.
  - His stars can drop from 3½ to 2 over a few weeks for turning people away. Worth checking that he's clearly told when the toolkit isn't driving.
- **Bugs.**
  - Dragging a flight onto the new plan on Launch Day evening throws an error on every move (a missing line on yesterday's row). Nothing breaks on screen, but it's real; I checked the code.
  - The "What a fare does" briefing never plays in chapter one. Its trigger looks for timetable blocks under an older name.


## 4. Decisions for you

These came up across all three parts. They're your call, not mine:

1. **Two Boards.** The old monthly "board review" still stops the plan until he changes something, and the new Board has a gentle word. Keep both, or only the gentle one?
2. **Red Kite and routes he can't fit.** Should Red Kite only take a route he had time to fly (as the stars rule now does), so a pupil whose planes are full isn't "ignoring" anything?
3. **One Red Kite card a Monday,** listing every route taken that day, instead of one card each? *(I'd do this.)*
4. **How often the graph question comes.** For a pupil who never changes anything, it's most weeks. Cap it?
5. **Fares.** £20 either side of the starting fares halves or quarters weekly profit. Is that the lesson you want, or one for Fable to soften?
6. **Years 5–6 or older?** DESIGN.md says Years 5–6. If that's right, the text-size and keyboard fixes in section 2 matter even more.
7. **Week 1 day by day** with five similar Day pages: keep, or add a "Keep this plan to Sunday" shortcut?

If you'd like, I can do the quick ones right away, with no new pictures needed:
- one Red Kite card a Monday;
- the overlapping labels on Graph 1;
- "Plan week 15" on 28 December;
- the what-if "£3 more" wording at the top fare;
- the odd task lines;
- the dragging error;
- the fare briefing's trigger;
- Enter-then-Enter for Σ SUM;
- the green button's text colour.

The rest needs Claude Design or a decision from you.

*Still round 4 of about 10. This was a check-up, not a new round.*
