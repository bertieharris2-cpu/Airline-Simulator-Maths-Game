# Hand-off to Fable: a data pass on chapter one (2 Nov 2026)

Hi Fable. Bertie is ready for you to look at the data again. Since you stepped out on 1 Nov, Bertie, Claude Design and I (Claude Code) have done four rounds on how chapter one looks and flows. Whenever a screen needed a figure or a word that didn't exist yet, I made one up so we could keep going. Each one is in the workbook like everything else, with "PLACEHOLDER (Claude Code, date)" in its notes.

This pack asks you to check those made-up figures and words, replace or improve them, and make the data hang together. It covers **chapter one only**: Launch Day (Mon 2 Sep 2030, day 1) to the chapter review (Sat 28 Dec 2030, day 118). Chapters 2 to 4 are parked until Bertie says otherwise.


## What's in the pack

| File | What it is |
| --- | --- |
| `Airline-World-Workbook.xlsx` | The game's workbook as of today: your v6.6, plus my additions from rounds 1 to 4 and today's quick fixes. This is the copy to work on. |
| `Fable-Handoff-Data-Pass-2-Nov-2026.md` | This note. |
| `Placeholders-for-Fable.md` | The running list of everything I made up, round by round, with what each one does and its current value. |
| `Review-2-Nov-2026.md` | Today's check-up for Bertie. Section 1 has six test pupils played through chapter one; the figures are summarised below. |
| `Import-Report.md` | What the importer made of the workbook today: 0 to fix, 22 to check, 7 notes. |


## How your changes get into the game

The game reads everything from the workbook. `tools/import_world.py` turns it into the game's data, and `python3 src/opening/build.py` builds the chapter-one file. So:

- **Keep the sheet names, the column headings and the ids**:
  - the `Key` in Settings;
  - the `id` in ScreenText and Routes.
  
  The game looks rows up by these. Change the values, words, notes and Status as you like.
- **In ScreenText:**
  - `|` splits the `text` column into separate lines;
  - `{city}`, `{step}`, `{month}`, `{sum}`, `{n}` and the like are filled in by the game, so keep them;
  - `**…**` makes words bold.
- **When you settle a row,** replace my PLACEHOLDER note with your own (e.g. "Fable, 3 Nov: checked"). Then we can all see what's done.
- **Send back the whole workbook** (v6.7 would follow on from v6.6) with a short list of what you changed. I'll compare it with the game's copy, merge it, re-import, rebuild and run the chapter-one test, as with v6.2 to v6.6.

My merge scripts (`tools/merge_1737.py`, `merge_1049.py`, `merge_r3.py`, `merge_r4.py`, `merge_r4b.py`, `merge_r4c.py`) have already been run on this copy. You don't need them; they're just how my rows got in.


## What I made up, sheet by sheet

The rows below are the ones marked PLACEHOLDER in the workbook. `Placeholders-for-Fable.md` has the same list by round, with the reasoning behind each one.

### Settings (14 rows)

| Key | Value now | What it does |
| --- | --- | --- |
| `routeColourDefault` | #4a6f99 | Colour for a route with no colour of its own (Status "placeholder") |
| `twoPlansMaxPlanes` | 1 | The "two plans, then Choose" screen only appears with this many planes or fewer |
| `newPlanSheet` | first change in week 1, or a new route | When a change is worked out on the whole-plan sheet instead of the Changes sheet |
| `dayPageTour` | Launch Day | Which Day page gets the dimmed walk-through |
| `tuesdayCountedSums` | 2 | Counted paper sums on Tuesday's new-plan sheet (Bertie: both count) |
| `rivalIgnoreWeeks` | 3 | Weeks a route that opened after Launch Day can go unflown, while one of his planes can reach it, before Red Kite takes it over |
| `rivalTakesShare` | 0.33 | Share of that route's passengers Red Kite then keeps, for good |
| `starsTurnedAwayNeedsSpare` | yes | The stars' "turned away 1 in 3, two weeks running" rule only counts when his planes had time for one more flight |
| `boardGapShare` | 0.1 | How far below the best plan with his planes a week must be to count as a large gap |
| `boardGapWeeks` | 3 | Weeks running with a large gap before the Board has a word (no fine) |
| `graphsFromWeek` | 2 | First Sunday with "Your week in pictures" |
| `graphQuestionGapShare` | 0.1 | The counted graph question only comes when the gap is more than this share of the best plan |
| `graph1MinWeeks` | 6 | Graph 1 is always at least this many weeks wide |
| `graph1StepPounds` | 5000 | Graph 1's gridlines, every £5,000 |

### Routes `colour` (18 routes)

The Routes sheet has no notes column, so these are flagged in the workbook's README sheet instead.

| Routes | Colours | Where they came from |
| --- | --- | --- |
| Dublin, Paris, Frankfurt | #2d7f68, #3b6aa8, #7a5aa8 | Claude Design's pictures (round 1) |
| Amsterdam, Geneva, Barcelona | #c0703a, #2f8f9a, #a8874f | Claude Design's graphs hand-off (round 4) |
| Madrid, Marrakech, Brussels, Berlin, Milan, Rome, Lisbon, Athens, Istanbul, Edinburgh, Reykjavik, Cairo | #b0567e, #9a5f45, #4a8fc0, #5d5fb8, #a8569a, #6f7f99, #8a6fc0, #5f9ab8, #b07a9e, #8c7a6b, #7a8fb0, #8f5f7f | Made up by me, avoiding red, amber, gold and green (those mean something else in DESIGN.md) |

### ScreenText (84 rows)

Most of these are words taken from Claude Design's pictures. I wrote the rest. They're grouped by screen, in the order the pupil meets them.

| Screen | ids | Notes for you |
| --- | --- | --- |
| The sum boxes | `signal.build`, `signal.paper` | The one-line instructions under every sum |
| Launch Day | `launch.job`, `launch.compare`, `ld3.job`, `ld3.footer`, `ld3.mine.task`, `ld3.mine.line` | |
| The Day page walk-through | `day.tour.0` to `day.tour.4` | |
| The take-off | `takeoff.skip` | |
| Two plans, then Choose | `tp.title`, `tp.lane.old`, `tp.choice`, `tp.compare`, `tp.footer`, `tp.co1`, `tp.co2`, `tp.co1.week`, `tp.co2.week` | The `.week` rows are my week-2 versions |
| The new-plan sheet | `np.title`, `np.cols`, `np.rows`, `np.diff`, `np.task`, `np.tk2`, `np.line`, `np.footer` | |
| Before / after | `ba.title`, `ba.co1`, `ba.co3.than`, `ba.table`, `ba.co4.np`, `ba.np.co1`, `ba.np.co2`, `ba.np.footer` | |
| The Changes sheet | `changes.head.week1`, `chg3.head.diff` | "Yesterday's plan" wording (Bertie's, and yours in v6.6) |
| Week 1 Sunday | `wk1.co.add`, `wk1.co.sum`, `wk1.add.watch`, `wk1.add.lineDone`, `wk1.add.signal`, `wk1.add.total`, `wk1.sum.watch`, `wk1.sum.signal`, `wk1.sum.same`, `wk1.sum.same2`, `wk1.easier`, `wk1.avg.watch`, `wk1.avg.mine`, `wk1.avg.go`, `wk1.avg.fin` | |
| Week 2 what-if | `wi2.co1`, `wi2.task`, `wi2.line`, `wi2.x7`, `wi2.x7.go`, `wi2.x4`, `wi2.x4.go`, `wi2.co4`, `wi2.footer` | |
| Week 2 what-if, a lower fare (new today) | `wi2.co1.less`, `wi2.co4.less`, `wi2.co4.less.up`, `wi2.co4.down` | When his fare is already at the top, the what-if tries a lower fare. The month line has to follow the money: at £3 less, three more people fly, so it comes out **more** money. |
| Red Kite and the Board | `rival.news`, `rival.week`, `board.note` | Only `rival.news` is still shown, on the Sunday review and in the news. `rival.week` and `board.note` were replaced by the Monday news cards below and are no longer on screen. Delete them or keep them, as you like. |
| Your week in pictures | `pics.go`, `pics.page`, `pics.back`, `pics.g1`, `pics.g2`, `pics.q.paper`, `pics.q.read`, `pics.q.wrong`, `pics.monday` | |
| Monday news cards | `news.rival`, `news.rival.times`, `news.board` | The board shows the airport as city and code, because the workbook has no airport names. Red Kite's times (07:10, 12:40, 17:55) are from Claude Design's picture. |

### Rules that live in the code, not the workbook

Say if you'd like either of these to become a setting.
- **Graph 2's figure, "profit for each hour of plane time".** It's what one of his planes makes flying that route all day (as many flights as fit, at his fare or the usual fare, with next week's passengers), divided by the hours flown. I read Claude Design's "profit a flight ÷ hours there and back" this way so that Red Kite taking passengers really shortens a route's bar.
- **One Red Kite card a Monday.** When Red Kite takes several routes on the same day, one card names them all. Its board is headed "DEPARTURES · LONDON", with a row for each route, using the three times in turn.


## What six test pupils showed about the figures

I played six pupils from the end of week 1 (Sun 8 Sep: one Twin Otter, £21,135 in the bank) to the chapter review, answering every sum correctly. Only their Monday choices differ. These are today's placeholder figures, so read this as "how the game reacts", not "are the numbers right".

| Pupil | What he does | Cash on 28 Dec | Weeks more than 10% below the best plan | Routes Red Kite took | Stars at the end |
| --- | --- | --- | --- | --- | --- |
| The planner | Buys a second Twin Otter on 23 Sep, picks the best plan every Monday | £560,599 | none | 6 | 4½ |
| Monthly | Same plane, re-plans on the first Monday of each month | £480,839 | weeks 7, 8, 9, 11 | 8 | 3½ |
| Expands once | Same plane with a good plan, then never changes it | £471,217 | weeks 7, 8, 9, 11 | 8 | 4 |
| The keeper | Keeps his Launch Day plan (Dublin ×2, Paris ×2 at £90 and £100) | £300,763 | weeks 7–9 and 11–13 | 9 | 4½ |
| Top fares | Same plan, both fares at £110 | £243,533 | weeks 2–9 | 9 | 4½ |
| Lowest fares | Same plan, both fares at £70 | £196,678 | weeks 2–9 and 11–14 | 9 | 4½ |

The points that touch your data:
1. **Fares swing profit hard.** Both fares at £110 halves weekly profit (about £18,000 down to £8,000). At £70 it's £4,000 to £5,000, and in week 7 that pupil made a loss of £1,028. That comes from each route's `fareOptions` and `demandAtFare` on the Routes sheet. Is it the lesson Bertie wants, or should it be gentler?
2. **Week 7 is a jolt.** On the Market sheet, week 7 (14 Oct) has fuel at £2.94 a litre, up from £1.97. The keeper's week drops from £16,400 to £12,200. That's a good moment for the graphs, but check the size. (The week's headline says "£3.00 a litre", which may be meant as a round figure.)
3. **Red Kite takes routes from everyone, even the best pupil.** Two small planes can't fly every route, so even the planner loses 6. For the keeper it costs nothing he can see, because he never flew them. `rivalIgnoreWeeks` and `rivalTakesShare` set this. Bertie hasn't yet decided whether Red Kite should only take routes the pupil had time to fly (decision 2 below).
4. **The graph question comes almost every week for a pupil who coasts.** The keeper got it 6 times and the lowest-fares pupil 12 times. `graphQuestionGapShare` is the threshold. Bertie may want a cap (decision 4).
5. **Stars hardly move.** Everyone ends on 3½ to 4½, and the keeper's 4½ equals the planner's. That may be fine; I'm only pointing it out.
6. **An older rule still steps in.** The monthly "board review" from the earlier sign-off rules can ask, at the November check, for "a plan that tests a different fare or route". On Monday 11 November the plan then waits until he changes something. It changed the plan of all five pupils who weren't picking the best plan every week. Bertie hasn't decided whether to keep it next to the new, gentler Board (decision 1).
7. **Re-planning pays, but late.** For the first three weeks the Launch Day plan already is the best plan for one plane, so everyone is within 0–3% of it. The gap opens in week 4, when the new routes and the second plane arrive. Buying the second plane lifts weekly profit from about £17,000 to about £28,000.


## Decisions still with Bertie

These change what the right figures are, so it may be worth checking with him first:
1. Keep both Boards (the old monthly review that blocks the plan, and the new gentle word), or only the gentle one?
2. Should Red Kite only take a route the pupil had time to fly, as the stars rule now does?
3. Cap how often the graph question comes?
4. Fares: is "£20 either side halves or quarters profit" the lesson, or should it be softer?
5. DESIGN.md says the pupils are in Years 5–6 (about 9 to 11). That matters for the size of the numbers and the words.
6. Week 1 day by day: keep the five similar Day pages, or add a "keep this plan to Sunday" shortcut?

One Red Kite card a Monday, which was decision 3 in the check-up, is done.


## Older things the importer flags

`Import-Report.md` lists 22 things to check. None of them come from this phase:
- the Finance lease-rule mismatch on the A220, A320 and 737;
- four Milestones that wait for features not built yet;
- three RouteNews rows with route `none`;
- Istanbul's archetype not being live;
- flight legs that aren't on a quarter hour (mostly long-haul routes outside chapter one).

Paris and Frankfurt are the two chapter-one routes in that last list.


## Please leave alone

- **DESIGN.md.** It's Bertie's design system; flag anything there instead.
- **Rows only used by chapters 2 to 4.** They're parked.
- **Ids and column headings** (see above).


*From Claude Code, 2 Nov 2026. Round 4 of about 10.*
